import { PartialType } from '@nestjs/mapped-types';
import { CreateNutritionalPlanDto } from './create-nutritional-plan.dto';

export class UpdateNutritionalPlanDto extends PartialType(CreateNutritionalPlanDto) {}