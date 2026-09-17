import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
  boundingBox: [number, number, number, number] | null; // [south, north, west, east]
  osmType: string;
  placeId: number;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private headers() {
    return {
      'User-Agent': this.configService.get<string>('nominatim.userAgent') ?? 'prism-cadastral-platform/1.0',
      Accept: 'application/json',
    };
  }

  async search(query: string, limit = 5): Promise<GeocodeResult[]> {
    const baseUrl = this.configService.get<string>('nominatim.baseUrl');
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${baseUrl}/search`, {
          params: { q: query, format: 'json', addressdetails: 1, limit },
          headers: this.headers(),
        }),
      );
      return (data as any[]).map((item) => ({
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        boundingBox: item.boundingbox
          ? (item.boundingbox.map((v: string) => parseFloat(v)) as [number, number, number, number])
          : null,
        osmType: item.type,
        placeId: item.place_id,
      }));
    } catch (err) {
      this.logger.error(`Nominatim search failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Location search is unavailable right now.');
    }
  }

  async reverse(lat: number, lng: number): Promise<{ displayName: string; address: Record<string, string> }> {
    const baseUrl = this.configService.get<string>('nominatim.baseUrl');
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${baseUrl}/reverse`, {
          params: { lat, lon: lng, format: 'json', addressdetails: 1 },
          headers: this.headers(),
        }),
      );
      return { displayName: data.display_name, address: data.address ?? {} };
    } catch (err) {
      this.logger.error(`Nominatim reverse geocode failed: ${(err as Error).message}`);
      throw new ServiceUnavailableException('Reverse geocoding is unavailable right now.');
    }
  }
}
