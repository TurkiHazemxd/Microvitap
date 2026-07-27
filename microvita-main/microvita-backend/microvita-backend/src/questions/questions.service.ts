import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) 
    private questionModel: Model<QuestionDocument>,
  ) {}

  // Get all questions
  async findAll(): Promise<Question[]> {
    return this.questionModel.find().exec();
  }

  // Get a single question by ID
  async findOne(id: string): Promise<Question> {
    const question = await this.questionModel.findOne({ id }).exec();
    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return question;
  }

  // Create or update questions (bulk upsert)
  async upsertQuestions(questions: Question[]): Promise<Question[]> {
    const results = [];
    for (const questionData of questions) {
      const result = await this.questionModel.findOneAndUpdate(
        { id: questionData.id },
        { ...questionData },
        { upsert: true, new: true }
      ).exec();
      results.push(result);
    }
    return results;
  }

  // Update a single question
  async updateQuestion(id: string, updateData: Partial<Question>): Promise<Question> {
    const updated = await this.questionModel.findOneAndUpdate(
      { id },
      { ...updateData },
      { new: true }
    ).exec();
    if (!updated) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return updated;
  }

  // Reset to default questions
  async resetToDefault(defaultQuestions: Question[]): Promise<Question[]> {
    // Delete all existing questions
    await this.questionModel.deleteMany({}).exec();
    // Insert default questions
    const results = await this.questionModel.insertMany(defaultQuestions);
    return results;
  }
}