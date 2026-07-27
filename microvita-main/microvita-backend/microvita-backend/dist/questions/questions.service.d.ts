import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
export declare class QuestionsService {
    private questionModel;
    constructor(questionModel: Model<QuestionDocument>);
    findAll(): Promise<Question[]>;
    findOne(id: string): Promise<Question>;
    upsertQuestions(questions: Question[]): Promise<Question[]>;
    updateQuestion(id: string, updateData: Partial<Question>): Promise<Question>;
    resetToDefault(defaultQuestions: Question[]): Promise<Question[]>;
}
