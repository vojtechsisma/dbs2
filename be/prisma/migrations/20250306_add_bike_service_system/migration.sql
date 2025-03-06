-- Create enum types first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE "UserRole" AS ENUM ('TECHNICIAN', 'CUSTOMER');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservationstatus') THEN
        CREATE TYPE "ReservationStatus" AS ENUM ('NEW', 'CONFIRMED', 'PROCESSING', 'DONE', 'CLOSED');
    END IF;
END$$;

-- Step 1: Modify and extend the existing User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "login" TEXT;
ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE INTEGER;
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT nextval('"User_id_seq"');
ALTER TABLE "User" RENAME COLUMN "id" TO "user_id";

-- Add the role column with enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'role') THEN
        ALTER TABLE "User" ADD COLUMN "role" "UserRole" DEFAULT 'CUSTOMER';
    ELSE
        ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
    END IF;
END$$;

-- Add unique constraint to login if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'User_login_key' AND conrelid = '"User"'::regclass
    ) THEN
        ALTER TABLE "User" ADD CONSTRAINT "User_login_key" UNIQUE ("login");
    END IF;
END $$;

-- Add index to email if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'User_email_idx' AND tablename = 'User'
    ) THEN
        CREATE INDEX "User_email_idx" ON "User"("email");
    END IF;
END $$;

-- Step 2: Create the BikeBrand table
CREATE TABLE IF NOT EXISTS "BikeBrand" (
    "brand_id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Step 3: Create the Bike table
CREATE TABLE IF NOT EXISTS "Bike" (
    "bike_id" SERIAL PRIMARY KEY,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand_id" INTEGER,
    "brand_other" TEXT,
    "details" JSONB,
    "owner_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("owner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("brand_id") REFERENCES "BikeBrand"("brand_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Add index to owner_id
CREATE INDEX "Bike_owner_id_idx" ON "Bike"("owner_id");

-- Step 4: Create the Reservation table
CREATE TABLE IF NOT EXISTS "Reservation" (
    "reservation_id" SERIAL PRIMARY KEY,
    "reservation_date" TIMESTAMP(3) NOT NULL,
    "problem_description" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'NEW',
    "customer_id" INTEGER NOT NULL,
    "bike_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("customer_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("bike_id") REFERENCES "Bike"("bike_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Add indexes
CREATE INDEX "Reservation_customer_id_idx" ON "Reservation"("customer_id");
CREATE INDEX "Reservation_bike_id_idx" ON "Reservation"("bike_id");
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- Step 5: Create the Service table
CREATE TABLE IF NOT EXISTS "Service" (
    "service_id" SERIAL PRIMARY KEY,
    "service_date" TIMESTAMP(3) NOT NULL,
    "repair_description" TEXT NOT NULL,
    "bike_id" INTEGER NOT NULL,
    "technician_id" INTEGER NOT NULL,
    "reservation_id" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("bike_id") REFERENCES "Bike"("bike_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("technician_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("reservation_id") REFERENCES "Reservation"("reservation_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Add indexes
CREATE INDEX "Service_bike_id_idx" ON "Service"("bike_id");
CREATE INDEX "Service_technician_id_idx" ON "Service"("technician_id");
CREATE INDEX "Service_reservation_id_idx" ON "Service"("reservation_id");

-- Step 6: Create the Image table
CREATE TABLE IF NOT EXISTS "Image" (
    "image_id" SERIAL PRIMARY KEY,
    "bike_id" INTEGER,
    "service_id" INTEGER,
    "path" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("bike_id") REFERENCES "Bike"("bike_id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("service_id") REFERENCES "Service"("service_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Add indexes
CREATE INDEX "Image_bike_id_idx" ON "Image"("bike_id");
CREATE INDEX "Image_service_id_idx" ON "Image"("service_id");

-- Step 7: Create Views

-- View 1: CustomerBikesView - Shows customers with their bikes
CREATE OR REPLACE VIEW "CustomerBikesView" AS
SELECT 
    u.user_id,
    u.name AS customer_name,
    u.email,
    u.phone,
    b.bike_id,
    b.model,
    b.type,
    COALESCE(bb.name, b.brand_other) AS brand_name,
    b.details
FROM 
    "User" u
JOIN 
    "Bike" b ON u.user_id = b.owner_id
LEFT JOIN 
    "BikeBrand" bb ON b.brand_id = bb.brand_id
WHERE 
    u.role = 'CUSTOMER'::"UserRole";

-- View 2: ReservationStatusView - Provides a summary of reservations by status
CREATE OR REPLACE VIEW "ReservationStatusView" AS
SELECT 
    r.status,
    COUNT(*) AS count,
    MIN(r.reservation_date) AS earliest_date,
    MAX(r.reservation_date) AS latest_date
FROM 
    "Reservation" r
GROUP BY 
    r.status;

-- View 3: BikeServiceHistoryView - Shows service history for each bike
CREATE OR REPLACE VIEW "BikeServiceHistoryView" AS
SELECT 
    b.bike_id,
    b.model,
    b.type,
    COALESCE(bb.name, b.brand_other) AS brand_name,
    u.user_id AS owner_id,
    u.name AS owner_name,
    s.service_id,
    s.service_date,
    s.repair_description,
    ut.name AS technician_name,
    r.reservation_id,
    r.problem_description
FROM 
    "Bike" b
LEFT JOIN 
    "BikeBrand" bb ON b.brand_id = bb.brand_id
JOIN 
    "User" u ON b.owner_id = u.user_id
LEFT JOIN 
    "Service" s ON b.bike_id = s.bike_id
LEFT JOIN 
    "User" ut ON s.technician_id = ut.user_id
LEFT JOIN 
    "Reservation" r ON s.reservation_id = r.reservation_id
ORDER BY 
    b.bike_id, s.service_date DESC;

-- Step 8: Create Functions

-- Function 1: Count bikes by type
CREATE OR REPLACE FUNCTION count_bikes_by_type(bike_type TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM "Bike" WHERE type = bike_type);
END;
$$ LANGUAGE plpgsql;

-- Function 2: Calculate service stats for a technician
CREATE OR REPLACE FUNCTION get_technician_service_stats(tech_id INTEGER)
RETURNS TABLE (
    total_services BIGINT,
    avg_services_per_month NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS total_services,
        COUNT(*) / NULLIF(EXTRACT(MONTH FROM AGE(CURRENT_DATE, MIN(service_date))), 0) AS avg_services_per_month
    FROM 
        "Service"
    WHERE 
        technician_id = tech_id;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Find bikes needing service (not serviced in more than 6 months)
CREATE OR REPLACE FUNCTION find_bikes_needing_service()
RETURNS TABLE (
    bike_id INTEGER,
    model TEXT,
    owner_name TEXT,
    owner_email TEXT,
    last_service_date TIMESTAMP,
    days_since_service INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.bike_id,
        b.model,
        u.name AS owner_name,
        u.email AS owner_email,
        MAX(s.service_date) AS last_service_date,
        EXTRACT(DAY FROM AGE(CURRENT_DATE, MAX(s.service_date)))::INTEGER AS days_since_service
    FROM 
        "Bike" b
    JOIN 
        "User" u ON b.owner_id = u.user_id
    LEFT JOIN 
        "Service" s ON b.bike_id = s.bike_id
    GROUP BY 
        b.bike_id, b.model, u.name, u.email
    HAVING 
        MAX(s.service_date) IS NULL OR 
        EXTRACT(DAY FROM AGE(CURRENT_DATE, MAX(s.service_date))) > 180
    ORDER BY 
        last_service_date NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create Procedures

-- Procedure 1: Create a new reservation with transaction
CREATE OR REPLACE PROCEDURE create_reservation(
    p_reservation_date TIMESTAMP,
    p_problem_description TEXT,
    p_customer_id INTEGER,
    p_bike_id INTEGER,
    INOUT p_reservation_id INTEGER DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Start transaction
    BEGIN
        -- Check if bike belongs to the customer
        IF NOT EXISTS (SELECT 1 FROM "Bike" WHERE bike_id = p_bike_id AND owner_id = p_customer_id) THEN
            RAISE EXCEPTION 'Bike does not belong to the customer';
        END IF;

        -- Insert the reservation
        INSERT INTO "Reservation" (
            reservation_date,
            problem_description,
            status,
            customer_id,
            bike_id,
            "createdAt",
            "updatedAt"
        ) VALUES (
            p_reservation_date,
            p_problem_description,
            'NEW'::"ReservationStatus",
            p_customer_id,
            p_bike_id,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ) RETURNING reservation_id INTO p_reservation_id;

        -- If we get here, commit the transaction
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            -- Roll back the transaction
            ROLLBACK;
            -- Re-raise the exception
            RAISE;
    END;
END;
$$;

-- Procedure 2: Complete a service and update reservation status
CREATE OR REPLACE PROCEDURE complete_service(
    p_reservation_id INTEGER,
    p_repair_description TEXT,
    p_technician_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_bike_id INTEGER;
BEGIN
    -- Start transaction
    BEGIN
        -- Get the bike ID from the reservation
        SELECT bike_id INTO v_bike_id
        FROM "Reservation"
        WHERE reservation_id = p_reservation_id;

        IF v_bike_id IS NULL THEN
            RAISE EXCEPTION 'Reservation not found';
        END IF;

        -- Update reservation status to DONE
        UPDATE "Reservation"
        SET status = 'DONE'::"ReservationStatus", "updatedAt" = CURRENT_TIMESTAMP
        WHERE reservation_id = p_reservation_id;

        -- Insert service record
        INSERT INTO "Service" (
            service_date,
            repair_description,
            bike_id,
            technician_id,
            reservation_id,
            "createdAt",
            "updatedAt"
        ) VALUES (
            CURRENT_TIMESTAMP,
            p_repair_description,
            v_bike_id,
            p_technician_id,
            p_reservation_id,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        -- If we get here, commit the transaction
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            -- Roll back the transaction
            ROLLBACK;
            -- Re-raise the exception
            RAISE;
    END;
END;
$$;

-- Procedure 3: Transfer bike ownership
CREATE OR REPLACE PROCEDURE transfer_bike_ownership(
    p_bike_id INTEGER,
    p_new_owner_id INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Start transaction
    BEGIN
        -- Check if new owner exists and is a customer
        IF NOT EXISTS (SELECT 1 FROM "User" WHERE user_id = p_new_owner_id AND role = 'CUSTOMER'::"UserRole") THEN
            RAISE EXCEPTION 'New owner not found or not a customer';
        END IF;

        -- Update bike ownership
        UPDATE "Bike"
        SET owner_id = p_new_owner_id, "updatedAt" = CURRENT_TIMESTAMP
        WHERE bike_id = p_bike_id;

        -- If we get here, commit the transaction
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            -- Roll back the transaction
            ROLLBACK;
            -- Re-raise the exception
            RAISE;
    END;
END;
$$;

-- Step 10: Create Triggers

-- Trigger 1: Update reservation status when service is created
CREATE OR REPLACE FUNCTION update_reservation_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reservation_id IS NOT NULL THEN
        UPDATE "Reservation"
        SET status = 'PROCESSING'::"ReservationStatus", "updatedAt" = CURRENT_TIMESTAMP
        WHERE reservation_id = NEW.reservation_id AND status = 'CONFIRMED'::"ReservationStatus";
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_created_trigger
AFTER INSERT ON "Service"
FOR EACH ROW EXECUTE FUNCTION update_reservation_status();

-- Trigger 2: Validate dates when creating or updating reservations
CREATE OR REPLACE FUNCTION validate_reservation_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if reservation date is in the future
    IF NEW.reservation_date <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Reservation date must be in the future';
    END IF;
    
    -- Check if there are no conflicting reservations
    IF EXISTS (
        SELECT 1
        FROM "Reservation"
        WHERE 
            reservation_id != COALESCE(NEW.reservation_id, 0) AND
            ABS(EXTRACT(EPOCH FROM (reservation_date - NEW.reservation_date)) / 3600) < 2
    ) THEN
        RAISE EXCEPTION 'There is already a reservation within 2 hours of this time';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservation_date_validation_trigger
BEFORE INSERT OR UPDATE ON "Reservation"
FOR EACH ROW EXECUTE FUNCTION validate_reservation_date();