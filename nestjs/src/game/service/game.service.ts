import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../model/game.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
  ) {}

  getAll(): Promise<Game[]> {
    return this.gameRepository.find();
  }

  async getOneById(id: number): Promise<Game> {
    const user = await this.gameRepository.findOne(id);
    if (user) {
      return user;
    }
    throw new HttpException(
      'Game with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  createGame(): Promise<Game> {
    const newGame = this.gameRepository.create();
    return this.gameRepository.save(newGame);
  }
}
