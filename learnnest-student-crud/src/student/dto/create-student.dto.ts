import { IsEmail, IsNotEmpty, IsInt } from 'class-validator';

export class CreateStudentDto {
    @IsNotEmpty()
    name: string;

    @IsInt()
    age: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;
}
