import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
// import { Pet } from '@prisma/client'; // O tipo Pet não será reconhecido até o prisma generate

@UseGuards(JwtAuthGuard) // Aplicar JwtAuthGuard a todas as rotas deste controller
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(
    @Body() createPetDto: CreatePetDto,
    @Request() req: { user: JwtPayload },
  ) {
    // req.user.sub é o ID do usuário logado (ownerId)
    return this.petsService.create(createPetDto, req.user.userId);
  }

  @Get()
  findAll(@Request() req: { user: JwtPayload }) {
    return this.petsService.findAllByOwner(req.user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: JwtPayload },
  ) {
    return this.petsService.findOneByOwner(id, req.user.userId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePetDto: UpdatePetDto,
    @Request() req: { user: JwtPayload },
  ) {
    return this.petsService.update(id, updatePetDto, req.user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: JwtPayload },
  ) {
    return this.petsService.remove(id, req.user.userId);
  }
}
