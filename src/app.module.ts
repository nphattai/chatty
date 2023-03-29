import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PostModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required()
      })
    }),
    PrismaModule,
    AuthModule,
    UserModule
  ]
})
export class AppModule {}
