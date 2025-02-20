import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserEntity } from 'src/users/entities/user.entity';

export class PostEntity {
  id: number;

  slug: string;

  title: string;

  content: string;

  createdAt: Date;

  updatedAt: Date;

  authorId: number;

  @ApiProperty({ type: () => UserEntity })
  author?: User;
}
