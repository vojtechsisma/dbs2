import slugify from 'slugify';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PostEntity } from './entities/post.entity';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthenticateddRequest } from 'src/lib/types';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto, request: AuthenticateddRequest) {
    const data = {
      ...createPostDto,
      slug: slugify(createPostDto.title, { lower: true }),
      authorId: request.user.id,
    };

    return this.prisma.post.create({ data });
  }

  findAll(): Promise<PostEntity[]> {
    return this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    });
  }

  findOne(slug: string): Promise<PostEntity> {
    return this.prisma.post.findUniqueOrThrow({
      where: { slug },
      include: { author: true },
    });
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    request: AuthenticateddRequest,
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { author: true },
    });

    if (post.author.id !== request.user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: number, request: AuthenticateddRequest) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { author: true },
    });

    if (post.author.id !== request.user.id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return await this.prisma.post.delete({
      where: { id },
    });
  }
}
