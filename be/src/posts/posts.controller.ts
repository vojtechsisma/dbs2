import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Controller,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthenticateddRequest } from 'src/lib/types';
import { PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() request: AuthenticateddRequest,
  ): Promise<PostEntity> {
    return this.postsService.create(createPostDto, request);
  }

  @Get()
  findAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string): Promise<PostEntity> {
    return this.postsService.findOne(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() request: AuthenticateddRequest,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostDto, request);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticateddRequest,
  ) {
    return this.postsService.remove(id, request);
  }
}
