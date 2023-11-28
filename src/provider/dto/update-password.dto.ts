import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsStrongPassword } from "class-validator";

export class UpdatePasswordDto {
  // old password
  @ApiProperty()
  @IsNotEmpty({ message: "Old Password is required" })
  @IsStrongPassword()
  oldPassword: string;

  // new password
  @ApiProperty()
  @IsNotEmpty({ message: "New Password is required" })
  @IsStrongPassword()
  newPassword: string;
}