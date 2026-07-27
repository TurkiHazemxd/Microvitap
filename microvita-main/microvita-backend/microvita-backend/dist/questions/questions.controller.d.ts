import { QuestionsService } from './questions.service';
export declare class QuestionsController {
    private readonly questionsService;
    constructor(questionsService: QuestionsService);
    findAll(): Promise<import("./schemas/question.schema").Question[]>;
    updateQuestion(id: string, updateData: Partial<any>): Promise<import("./schemas/question.schema").Question>;
    upsertQuestions(questions: any[]): Promise<import("./schemas/question.schema").Question[]>;
}
