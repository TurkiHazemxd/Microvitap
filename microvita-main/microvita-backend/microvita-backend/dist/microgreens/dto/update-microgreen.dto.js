"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMicrogreenDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_microgreen_dto_1 = require("./create-microgreen.dto");
class UpdateMicrogreenDto extends (0, mapped_types_1.PartialType)(create_microgreen_dto_1.CreateMicrogreenDto) {
}
exports.UpdateMicrogreenDto = UpdateMicrogreenDto;
//# sourceMappingURL=update-microgreen.dto.js.map