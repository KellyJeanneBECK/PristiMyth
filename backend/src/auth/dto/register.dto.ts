import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @MinLength(3, {
    message: 'Le pseudo doit faire minimum 3 caractères',
  })
  @MaxLength(50, {
    message: 'Le pseudo ne peut pas faire plus de 50 caractères',
  })
  @Matches(/^[\p{L}\p{N}_.-]+$/u, {
    message:
      'Le pseudo ne peut contenir que des lettres, chiffres, "_", "." et "-".',
  })
  pseudo: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254, {
    message: "L'email ne peut pas faire plus de 254 caractères",
  })
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return value;
  })
  email?: string;

  @IsString()
  @MinLength(12, {
    message: 'Le mot de passe doit faire minimum 12 caractères',
  })
  @MaxLength(128, {
    message: 'Le mot de passe ne peut pas faire plus de 128 caractères',
  })
  password: string;
}
