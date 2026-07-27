"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateNutritionalPlanDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_nutritional_plan_dto_1 = require("./create-nutritional-plan.dto");
class UpdateNutritionalPlanDto extends (0, mapped_types_1.PartialType)(create_nutritional_plan_dto_1.CreateNutritionalPlanDto) {
}
exports.UpdateNutritionalPlanDto = UpdateNutritionalPlanDto;
//# sourceMappingURL=update-nutritional-plan.dto.js.map