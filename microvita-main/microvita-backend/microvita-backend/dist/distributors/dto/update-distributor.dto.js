"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDistributorDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_distributor_dto_1 = require("./create-distributor.dto");
class UpdateDistributorDto extends (0, mapped_types_1.PartialType)(create_distributor_dto_1.CreateDistributorDto) {
}
exports.UpdateDistributorDto = UpdateDistributorDto;
//# sourceMappingURL=update-distributor.dto.js.map