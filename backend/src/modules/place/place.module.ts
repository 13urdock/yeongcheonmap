import { Module } from '@nestjs/common';
import { PlaceCandidateService } from './place-candidate.service';
import { PlaceResolveService } from './place-resolve.service';
import { NaverLocalClient } from './place-search/naver-local.client';
import { PlaceController } from './place.controller';
import { PlaceRepository } from './place.repository';
import { PlaceService } from './place.service';

@Module({
  controllers: [PlaceController],
  providers: [PlaceService, PlaceCandidateService, PlaceResolveService, PlaceRepository, NaverLocalClient],
  exports: [PlaceService, PlaceResolveService],
})
export class PlaceModule {}
