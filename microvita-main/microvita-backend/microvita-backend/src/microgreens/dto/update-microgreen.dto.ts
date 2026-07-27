import { PartialType } from '@nestjs/mapped-types';
import { CreateMicrogreenDto } from './create-microgreen.dto';

export class UpdateMicrogreenDto extends PartialType(CreateMicrogreenDto) {}