import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus, Get, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { Public } from '../common/decorators/public.decorator';

@Controller('upload')
export class UploadController {
  // Regular file upload - POST /api/upload
  @Public()
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = resolve(process.cwd(), 'public', 'images');
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    return {
      success: true,
      filename: file.filename,
      path: `/images/${file.filename}`,
    };
  }

  // Base64 upload endpoint - POST /api/upload/base64 (note the slash)
  @Public()
  @Post('base64')
  async uploadBase64(@Body() body: { base64: string; filename: string }) {
    console.log('=== BASE64 UPLOAD RECEIVED ===');
    console.log('Filename:', body.filename);
    console.log('Base64 length:', body.base64?.length || 0);
    
    try {
      if (!body.base64) {
        throw new HttpException('No base64 data provided', HttpStatus.BAD_REQUEST);
      }

      // Remove the data:image/jpeg;base64, prefix if present
      let base64Data = body.base64;
      if (base64Data.includes('base64,')) {
        base64Data = base64Data.split('base64,')[1];
      }
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Save the file
      const uploadPath = resolve(process.cwd(), 'public', 'images');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      
      const filePath = resolve(uploadPath, body.filename);
      writeFileSync(filePath, buffer);
      
      console.log('File saved:', filePath);
      
      return {
        success: true,
        filename: body.filename,
        path: `/images/${body.filename}`,
      };
    } catch (error) {
      console.error('Error saving base64 image:', error);
      throw new HttpException('Failed to save image: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('list')
  async listImages() {
    const imagesPath = resolve(process.cwd(), 'public', 'images');
    if (existsSync(imagesPath)) {
      const files = readdirSync(imagesPath);
      return { 
        path: imagesPath,
        exists: true,
        images: files 
      };
    }
        
    return { 
      path: imagesPath,
      exists: false,
      images: [] 
    };
    
  }
}