import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
export declare class RecipesController {
    private readonly recipesService;
    constructor(recipesService: RecipesService);
    findAll(search?: string): Promise<import("./schemas/recipe.schema").Recipe[]>;
    findOne(id: string): Promise<import("./schemas/recipe.schema").Recipe>;
    create(createRecipeDto: CreateRecipeDto): Promise<import("./schemas/recipe.schema").Recipe>;
    update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<import("./schemas/recipe.schema").Recipe>;
    remove(id: string): Promise<void>;
}
