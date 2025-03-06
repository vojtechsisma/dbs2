import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { ReservationStatus, UserRole } from '@prisma/client';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class ReservationsService {
    constructor(private prisma: PrismaService) { }

    async create(createReservationDto: CreateReservationDto, userId: number) {
        // Check if bike belongs to the customer
        const bike = await this.prisma.bike.findUnique({
            where: { id: createReservationDto.bikeId }
        });

        if (!bike) {
            throw new NotFoundException(`Bike with ID ${createReservationDto.bikeId} not found`);
        }

        if (bike.ownerId !== userId) {
            throw new ConflictException('You can only create reservations for your own bikes');
        }

        // Create the reservation directly using Prisma ORM instead of stored procedure
        const newReservation = await this.prisma.reservation.create({
            data: {
                reservationDate: new Date(createReservationDto.reservationDate),
                problemDescription: createReservationDto.problemDescription,
                status: 'NEW',
                customerId: userId,
                bikeId: createReservationDto.bikeId,
            },
            include: {
                bike: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        login: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        return newReservation;
    }

    async findAll(userId?: number, role?: UserRole, status?: ReservationStatus) {
        const where: any = {};

        // Filter by status if provided
        if (status) {
            where.status = {
                in: status
            };
        }

        // Filter by customer ID if role is CUSTOMER
        if (role === 'CUSTOMER' && userId) {
            where.customerId = userId;
        }

        return this.prisma.reservation.findMany({
            where,
            include: {
                bike: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        login: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                services: {
                    include: {
                        technician: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        }
                    }
                }
            },
            orderBy: { reservationDate: 'desc' }
        });
    }

    async findOne(id: number) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: {
                bike: {
                    include: {
                        brand: true,
                        images: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        login: true,
                        createdAt: true,
                        updatedAt: true
                    }
                },
                services: {
                    include: {
                        technician: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true
                            }
                        },
                        images: true
                    }
                }
            }
        });

        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        return reservation;
    }

    async update(id: number, updateReservationDto: UpdateReservationDto, userId: number, role: UserRole) {
        // First check if the reservation exists
        const reservation = await this.prisma.reservation.findUnique({
            where: { id },
            include: { bike: true }
        });

        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Check permissions: customers can only update their own reservations
        if (role === 'CUSTOMER' && reservation.customerId !== userId) {
            throw new ConflictException('You can only update your own reservations');
        }

        // If updating bikeId, check if the new bike belongs to the same customer
        if (updateReservationDto.bikeId && role === 'CUSTOMER') {
            const bike = await this.prisma.bike.findUnique({
                where: { id: updateReservationDto.bikeId }
            });

            if (!bike) {
                throw new NotFoundException(`Bike with ID ${updateReservationDto.bikeId} not found`);
            }

            if (bike.ownerId !== userId) {
                throw new ConflictException('You can only use your own bikes for reservations');
            }
        }

        // Only allow updating the status to CLOSED for customers
        if (role === 'CUSTOMER' && updateReservationDto.status && updateReservationDto.status !== ReservationStatus.CLOSED) {
            throw new ConflictException('Customers can only close reservations');
        }

        return this.prisma.reservation.update({
            where: { id },
            data: updateReservationDto,
            include: {
                bike: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        login: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });
    }

    async updateStatus(id: number, updateStatusDto: UpdateStatusDto) {
        // Check if reservation exists
        const reservation = await this.prisma.reservation.findUnique({
            where: { id }
        });

        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        return this.prisma.reservation.update({
            where: { id },
            data: { status: updateStatusDto.status },
            include: {
                bike: true,
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        login: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });
    }

    async remove(id: number, userId: number, role: UserRole) {
        // First check if the reservation exists
        const reservation = await this.prisma.reservation.findUnique({
            where: { id }
        });

        if (!reservation) {
            throw new NotFoundException(`Reservation with ID ${id} not found`);
        }

        // Check permissions: customers can only delete their own reservations
        if (role === 'CUSTOMER' && reservation.customerId !== userId) {
            throw new ConflictException('You can only delete your own reservations');
        }

        // Check if there are any services associated with this reservation
        const services = await this.prisma.service.findMany({
            where: { reservationId: id }
        });

        if (services.length > 0) {
            throw new ConflictException('Cannot delete a reservation with associated services');
        }

        return this.prisma.reservation.delete({
            where: { id }
        });
    }

    // Get reservation statistics by status using the ReservationStatusView
    async getReservationStats() {
        return this.prisma.$queryRaw`SELECT * FROM "ReservationStatusView"`;
    }
}
