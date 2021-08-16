import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { UserI } from '../models/user.interface';
export declare class UserService {
    private userRepository;
    constructor(userRepository: Repository<UserEntity>);
    add(user: UserI): Observable<UserI>;
    findAll(): Observable<UserI[]>;
}
