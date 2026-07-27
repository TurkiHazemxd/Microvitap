import { Model } from 'mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
export declare class RecipesService {
    private recipeModel;
    constructor(recipeModel: Model<RecipeDocument>);
    create(createRecipeDto: CreateRecipeDto): Promise<Recipe>;
    findAll(): Promise<Recipe[]>;
    findOne(id: string): Promise<Recipe>;
    update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe>;
    remove(id: string): Promise<void>;
    search(query: string): Promise<Recipe[]>;
}
