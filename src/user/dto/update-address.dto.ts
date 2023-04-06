import { IsOptional } from 'class-validator';

export class UpdateAddressDto {
  @IsOptional()
  street: string;

  @IsOptional()
  city: string;

  @IsOptional()
  country: string;
}
