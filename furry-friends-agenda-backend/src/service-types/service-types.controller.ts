import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ServiceTypesService } from './service-types.service';
import { CreateServiceTypeDto } from './dto/create-service-type.dto';
import { UpdateServiceTypeDto } from './dto/update-service-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { Roles } from '../auth/decorators/roles.decorator'; // Para futuro RolesGuard
// import { RolesGuard } from '../auth/guards/roles.guard'; // Para futuro RolesGuard

@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Proteger, futuramente adicionar @Roles('ADMIN') e RolesGuard
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  create(@Body() createServiceTypeDto: CreateServiceTypeDto) {
    return this.serviceTypesService.create(createServiceTypeDto);
  }

  @Get()
  findAll() {
    // Endpoint público para listar tipos de serviço
    return this.serviceTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    // Endpoint público
    return this.serviceTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // Proteger, futuramente adicionar @Roles('ADMIN') e RolesGuard
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceTypeDto: UpdateServiceTypeDto,
  ) {
    return this.serviceTypesService.update(id, updateServiceTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // Proteger, futuramente adicionar @Roles('ADMIN') e RolesGuard
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceTypesService.remove(id);
  }
}
