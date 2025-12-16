import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from './devices.service';

@Controller('devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('register')
  async registerDevice(@Body() body: any) {
    return this.devicesService.registerDevice(body.tenant_id, body.device_id, body.device_type, body.location_id);
  }

  @Get(':id/status')
  async getDeviceStatus(@Param('id') id: string) {
    return this.devicesService.getDeviceStatus(id);
  }
}
