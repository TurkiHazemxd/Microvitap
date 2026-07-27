import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { email, motdepasse, fullname, role } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    const user = new this.userModel({
      email,
      motdepasse: hashedPassword,
      fullname,
      role: role || UserRole.CONSUMER,
    });

    return user.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-motdepasse').exec();
  }

  async findById(id: string): Promise<UserDocument> {
  if (!id) {
    throw new NotFoundException('User id is missing');
  }

  const user = await this.userModel
    .findOne({
      $or: [
        { _id: id },
        { id: id },
      ],
    })
    .select('-motdepasse')
    .exec();

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
  if (!id) {
    throw new NotFoundException('User id is missing');
  }

  // 🔥 ADD THIS CHECK
  if (updateUserDto.email) {
    const existing = await this.userModel.findOne({ email: updateUserDto.email });
    if (existing && existing._id.toString() !== id) {
      throw new ConflictException('Email already exists');
    }
  }

  const user = await this.userModel
    .findByIdAndUpdate(id, updateUserDto, { new: true })
    .select('-motdepasse')
    .exec();

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

async remove(id: string): Promise<void> {
  if (!id) {
    throw new NotFoundException('User id is missing');
  }

  const result = await this.userModel.findOneAndDelete({
    $or: [
      { _id: id },
      { id: id },
    ],
  }).exec();

  if (!result) {
    throw new NotFoundException('User not found');
  }
}

  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.motdepasse);
  }

  async getStats() {
    const total = await this.userModel.countDocuments();
    const byRole = await this.userModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    return { total, byRole };
  }
}