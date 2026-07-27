// IMPORTS
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';  
import * as fs from 'fs';      
import * as path from 'path';  

// APP CONTROLLER
// Handles root-level routes that don't belong to specific feature modules
// All routes here are for debugging and testing image serving
@Controller()
export class AppController {
  
  // URL: GET /debug-images
  // Purpose: Debugging tool to check where uploaded images are stored
  // Checks multiple possible paths and reports which ones exist
  @Public()  // No authentication required (debug tool)
  @Get('debug-images')
  debugImages() {
    // List of possible locations where images might be stored
    const possiblePaths = [
      path.join(__dirname, '..', 'public', 'images'),      // Compiled output path
      path.join(process.cwd(), 'public', 'images'),        // Current working directory
      path.join(__dirname, 'public', 'images'),            // Another variation
    ];
    
    // Check each path and return results
    const results = possiblePaths.map(p => ({
      path: p,                                    // The path being checked
      exists: fs.existsSync(p),                   // Does this folder exist?
      files: fs.existsSync(p) ? fs.readdirSync(p).slice(0, 10) : []  // First 10 files if exists
    }));
    
    return results;
  }
  
  // URL: GET /test-image/:filename
  // Purpose: Manually test if a specific image can be served
  // Returns the actual image file if found, otherwise 404 error
  @Public()  // No authentication required (testing tool)
  @Get('test-image/:filename')
  async testImage(@Param('filename') filename: string, @Res() res) {
    // Build full path to the image in public/images folder
    const imagePath = path.join(process.cwd(), 'public', 'images', filename);
    
    if (fs.existsSync(imagePath)) {
      // File exists - send it back as a file
      return res.sendFile(imagePath);
    } else {
      // File not found - show error with the path that was checked
      return res.status(404).send(`Image not found at: ${imagePath}`);
    }
  }
}