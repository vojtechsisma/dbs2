import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma.service';
import { PostsController } from './posts.controller';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
})
export class PostsModule {}
