import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';
// Fix for missing Express.Multer type
import type { Multer } from 'multer';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        bikeId: {
          type: 'number',
          description: 'ID of the bike (required if serviceId not provided)',
        },
        serviceId: {
          type: 'number',
          description: 'ID of the service (required if bikeId not provided)',
        },
        description: {
          type: 'string',
          description: 'Description of the image',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        // Check if the file is an image
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async upload(
    @UploadedFile() file: Multer.File,
    @Body() createImageDto: CreateImageDto,
    @Request() req,
  ) {
    // Convert string IDs to numbers
    if (createImageDto.bikeId && typeof createImageDto.bikeId === 'string') {
      createImageDto.bikeId = parseInt(createImageDto.bikeId as any);
    }
    if (
      createImageDto.serviceId &&
      typeof createImageDto.serviceId === 'string'
    ) {
      createImageDto.serviceId = parseInt(createImageDto.serviceId as any);
    }

    // File path to store in DB is relative to the root
    const relativePath = `/uploads/${file.filename}`;

    return this.imagesService.create(
      createImageDto,
      relativePath,
      req.user.id,
      req.user.role,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all images' })
  @ApiQuery({ name: 'bikeId', required: false, type: Number })
  @ApiQuery({ name: 'serviceId', required: false, type: Number })
  findAll(
    @Query('bikeId') bikeId?: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.imagesService.findAll(
      bikeId ? parseInt(bikeId) : undefined,
      serviceId ? parseInt(serviceId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get image metadata by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.findOne(id);
  }

  @Get('file/:id')
  @ApiOperation({ summary: 'Get image file by ID' })
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const image = await this.imagesService.findOne(id);
    const filePath = join(process.cwd(), image.path);

    // Try to determine content type from file extension
    const ext = image.path.split('.').pop()?.toLowerCase() || '';
    const contentTypeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    res.set({
      'Content-Type': contentType,
    });

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update image metadata' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImageDto: UpdateImageDto,
    @Request() req,
  ) {
    return this.imagesService.update(
      id,
      updateImageDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an image' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.imagesService.remove(id, req.user.id, req.user.role);
  }
}
