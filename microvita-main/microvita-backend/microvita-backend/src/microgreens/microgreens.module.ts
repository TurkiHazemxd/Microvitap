
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MicrogreensController } from './microgreens.controller';
import { MicrogreensService } from './microgreens.service';
import { Microgreen, MicrogreenSchema } from './schemas/microgreen.schema';

// Groups together everything related to microgreens:
// - Database schema
// - Controller (handles HTTP requests)
// - Service (handles business logic)
@Module({
  imports: [
  
    // registers the Microgreen schema with Mongoose
    // this makes the Microgreen model available for injection in this module
    MongooseModule.forFeature([
      { name: Microgreen.name, schema: MicrogreenSchema },
    ]),
  ],
  
  // handles incoming HTTP requests for /microgreens routes
  controllers: [MicrogreensController],
  
  // services that can be injected (used) within this module
  providers: [MicrogreensService],

  // makes MicrogreensService available to OTHER modules that import this module
  
  exports: [MicrogreensService],
})
export class MicrogreensModule {}