import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) {
       
    }
    async createUser(authCredentialsDto: AuthCredentialsDto): Promise<User> {
            const { username, password } = authCredentialsDto;

            const salt = await bcrypt.genSalt();// generate a salt for hashing. это что-бы усложнить хэширование
            const hashedPassword = await bcrypt.hash(password, salt);// hash the password with the salt. смешиваем пароль с солью и хэшируем

            const user = this.usersRepository.create({ username, password: hashedPassword });// create a new user entity
            try {
                await this.usersRepository.save(user);
            } catch (error) {
                if (error instanceof QueryFailedError && (error as any).code === '23505') {// show unique violation error
                    throw new ConflictException('Username already exists');
                }
                throw new InternalServerErrorException();
            }
            
            return user;
        }

        async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
            const { username, password } = authCredentialsDto;
            const user = await this.usersRepository.findOne({ where: { username } });

            if (user && (await bcrypt.compare(password, user.password))) {
                // if password is correct, return a JWT token or some other form of authentication token
                const payload: JwtPayload = { username };
                const accessToken = await this.jwtService.sign(payload);
                return { accessToken };
            } else {
                throw new UnauthorizedException('Please check your login credentials');
            }
        }
}
