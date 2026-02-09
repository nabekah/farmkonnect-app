"""
FarmKonnect Python SDK
Type-safe client library for FarmKonnect REST API

Example:
    >>> from farmkonnect import FarmKonnectClient
    >>> 
    >>> client = FarmKonnectClient(
    ...     base_url='https://api.farmkonnect.com',
    ...     token='your-jwt-token'
    ... )
    >>> 
    >>> # List farms
    >>> farms = client.farms.list(limit=10)
    >>> 
    >>> # Get crop analytics
    >>> analytics = client.crops.get_analytics(crop_id=1)
"""

import asyncio
import json
from typing import Any, Dict, List, Optional, Union
from urllib.parse import urljoin, urlencode
import aiohttp
import requests


__version__ = '1.0.0'
__all__ = ['FarmKonnectClient', 'AsyncFarmKonnectClient', 'APIError']


class APIError(Exception):
    """Custom API Error class"""
    
    def __init__(self, message: str, status_code: int, details: Optional[Dict] = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(f"{message} (Status: {status_code})")


class BaseClient:
    """Base client with common functionality"""
    
    def __init__(
        self,
        base_url: str = 'http://localhost:3001',
        token: Optional[str] = None,
        timeout: int = 30,
        retry_attempts: int = 3,
        retry_delay: float = 1.0
    ):
        self.base_url = base_url
        self.token = token
        self.timeout = timeout
        self.retry_attempts = retry_attempts
        self.retry_delay = retry_delay
    
    def _get_headers(self, extra_headers: Optional[Dict] = None) -> Dict[str, str]:
        """Get request headers with authentication"""
        headers = {
            'Content-Type': 'application/json',
            **(extra_headers or {})
        }
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        return headers
    
    def set_token(self, token: str) -> None:
        """Set authentication token"""
        self.token = token
    
    def clear_token(self) -> None:
        """Clear authentication token"""
        self.token = None


class FarmKonnectClient(BaseClient):
    """Synchronous FarmKonnect API Client"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.farms = FarmsAPI(self)
        self.crops = CropsAPI(self)
        self.livestock = LivestockAPI(self)
        self.breeding = BreedingAPI(self)
        self.marketplace = MarketplaceAPI(self)
        self.weather = WeatherAPI(self)
        self.financial = FinancialAPI(self)
        self.notifications = NotificationsAPI(self)
    
    def request(
        self,
        method: str,
        path: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make HTTP request with retry logic"""
        url = urljoin(self.base_url, path)
        
        for attempt in range(self.retry_attempts):
            try:
                response = requests.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    headers=self._get_headers(headers),
                    timeout=self.timeout
                )
                
                if not response.ok:
                    error_data = response.json() if response.text else {}
                    raise APIError(
                        error_data.get('message', 'Request failed'),
                        response.status_code,
                        error_data
                    )
                
                return response.json()
            
            except requests.RequestException as e:
                if attempt < self.retry_attempts - 1:
                    asyncio.run(asyncio.sleep(self.retry_delay * (2 ** attempt)))
                else:
                    raise APIError(str(e), 0)


class AsyncFarmKonnectClient(BaseClient):
    """Asynchronous FarmKonnect API Client"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.session: Optional[aiohttp.ClientSession] = None
        self.farms = AsyncFarmsAPI(self)
        self.crops = AsyncCropsAPI(self)
        self.livestock = AsyncLivestockAPI(self)
        self.breeding = AsyncBreedingAPI(self)
        self.marketplace = AsyncMarketplaceAPI(self)
        self.weather = AsyncWeatherAPI(self)
        self.financial = AsyncFinancialAPI(self)
        self.notifications = AsyncNotificationsAPI(self)
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def request(
        self,
        method: str,
        path: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make async HTTP request with retry logic"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        url = urljoin(self.base_url, path)
        
        for attempt in range(self.retry_attempts):
            try:
                async with self.session.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    headers=self._get_headers(headers),
                    timeout=aiohttp.ClientTimeout(total=self.timeout)
                ) as response:
                    if not response.ok:
                        error_data = await response.json() if response.content_type == 'application/json' else {}
                        raise APIError(
                            error_data.get('message', 'Request failed'),
                            response.status,
                            error_data
                        )
                    
                    return await response.json()
            
            except aiohttp.ClientError as e:
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_delay * (2 ** attempt))
                else:
                    raise APIError(str(e), 0)


# API Module Classes
class FarmsAPI:
    def __init__(self, client: FarmKonnectClient):
        self.client = client
    
    def list(self, limit: int = 10, offset: int = 0) -> Dict:
        return self.client.request('GET', '/api/trpc/farms.list', params={'limit': limit, 'offset': offset})
    
    def get(self, farm_id: int) -> Dict:
        return self.client.request('GET', f'/api/trpc/farms.get', params={'id': farm_id})
    
    def create(self, data: Dict) -> Dict:
        return self.client.request('POST', '/api/trpc/farms.create', data=data)
    
    def update(self, farm_id: int, data: Dict) -> Dict:
        return self.client.request('PUT', f'/api/trpc/farms.update', data=data, params={'id': farm_id})
    
    def delete(self, farm_id: int) -> Dict:
        return self.client.request('DELETE', f'/api/trpc/farms.delete', params={'id': farm_id})


class CropsAPI:
    def __init__(self, client: FarmKonnectClient):
        self.client = client
    
    def list(self, farm_id: int, status: Optional[str] = None) -> List[Dict]:
        params = {'farmId': farm_id}
        if status:
            params['status'] = status
        return self.client.request('GET', '/api/trpc/crops.list', params=params)
    
    def get(self, crop_id: int) -> Dict:
        return self.client.request('GET', '/api/trpc/crops.get', params={'id': crop_id})
    
    def create(self, data: Dict) -> Dict:
        return self.client.request('POST', '/api/trpc/crops.create', data=data)
    
    def get_analytics(self, crop_id: int) -> Dict:
        return self.client.request('GET', '/api/trpc/crops.getAnalytics', params={'cropId': crop_id})
    
    def get_soil_tests(self, crop_id: int) -> List[Dict]:
        return self.client.request('GET', '/api/trpc/crops.getSoilTests', params={'cropId': crop_id})
    
    def get_yield_records(self, crop_id: int) -> List[Dict]:
        return self.client.request('GET', '/api/trpc/crops.getYieldRecords', params={'cropId': crop_id})


class LivestockAPI:
    def __init__(self, client: FarmKonnectClient):
        self.client = client
    
    def list(self, farm_id: int, animal_type: Optional[str] = None) -> List[Dict]:
        params = {'farmId': farm_id}
        if animal_type:
            params['type'] = animal_type
        return self.client.request('GET', '/api/trpc/livestock.list', params=params)
    
    def get(self, animal_id: int) -> Dict:
        return self.client.request('GET', '/api/trpc/livestock.get', params={'id': animal_id})
    
    def create(self, data: Dict) -> Dict:
        return self.client.request('POST', '/api/trpc/livestock.create', data=data)
    
    def get_health_records(self, animal_id: int) -> List[Dict]:
        return self.client.request('GET', '/api/trpc/livestock.getHealthRecords', params={'animalId': animal_id})
    
    def add_health_record(self, data: Dict) -> Dict:
        return self.client.request('POST', '/api/trpc/livestock.addHealthRecord', data=data)


class BreedingAPI:
    def __init__(self, client: FarmKonnectClient):
        self.client = client
    
    def get_records(self, farm_id: int) -> List[Dict]:
        return self.client.request('GET', '/api/trpc/breeding.getRecords', params={'farmId': farm_id})
    
    def get_analytics(self, farm_id: int) -> Dict:
        return self.client.request('GET', '/api/trpc/breeding.getAnalytics', params={'farmId': farm_id})
    
    def calculate_compatibility(self, animal1_id: int, animal2_id: int) -> Dict:
        return self.client.request(
            'GET',
            '/api/trpc/breeding.calculateCompatibility',
            params={'animal1Id': animal1_id, 'animal2Id': animal2_id}
        )
    
    def get_recommendations(self, farm_id: int) -> List[Dict]:
        return self.client.request('GET', '/api/trpc/breeding.getRecommendations', params={'farmId': farm_id})


class MarketplaceAPI:
    def __init__(self, client: FarmKonnectClient):
        self.client = client
    
    def list_products(self, search: Optional[str] = None, category: Optional[str] = None,
                     min_price: Optional[float] = None, max_price: Optional[float] = None) -> List[Dict]:
        params = {}
        if search:
            params['search'] = search
        if category:
            params['category'] = category
        if min_price:
            params['minPrice'] = min_price
        if max_price:
            params['maxPrice'] = max_price
        return self.client.request('GET', '/api/trpc/marketplace.products', params=params)
    
    def get_product(self, product_id: int) -> Dict:
        return self.client.request('GET', '/api/trpc/marketplace.getProduct', params={'id': product_id})
    
    def create_order(self, data: Dict) -> Dict:
        return self.client.request('POST', '/api/trpc/marketplace.createOrder', data=data)
    
    def get_orders(self) -> List[Dict]:
        return self.client.request('GET', '/api/trpc/marketplace.getOrders')
    
    def get_cart(self) -> Dict:
        return self.client.request('GET', '/api/trpc/marketplace.getCart')
    
    def add_to_cart(self, product_id: int, quantity: int) -> Dict:
        return self.client.request('POST', '/api/trpc/marketplace.addToCart',
                                  data={'productId': product_id, 'quantity': quantity})
    
    def remove_from_cart(self, product_id: int) -> Dict:
        return self.client.request('POST', '/api/trpc/marketplace.removeFromCart',
                                  data={'productId': product_id})


class WeatherAPI:
    def __init__(self, client: FarmKonnectClient):
        self.client = client
    
    def get_forecast(self, farm_id: int, days: int = 7) -> Dict:
        return self.client.request('GET', '/api/trpc/weather.forecast',
                                  params={'farmId': farm_id, 'days': days})
    
    def get_alerts(self, farm_id: int) -> List[Dict]:
        return self.client.request('GET', '/api/trpc/weather.getAlerts', params={'farmId': farm_id})
    
    def get_crop_recommendations(self, farm_id: int) -> List[Dict]:
        return self.client.request('GET', '/api/trpc/weather.getCropRecommendations',
                                  params={'farmId': farm_id})


class FinancialAPI:
    def __init__(self, client: FarmKonnectClient):
        self.client = client
    
    def get_expenses(self, farm_id: int, start_date: Optional[str] = None,
                    end_date: Optional[str] = None) -> List[Dict]:
        params = {'farmId': farm_id}
        if start_date:
            params['startDate'] = start_date
        if end_date:
            params['endDate'] = end_date
        return self.client.request('GET', '/api/trpc/financial.getExpenses', params=params)
    
    def get_revenue(self, farm_id: int, start_date: Optional[str] = None,
                   end_date: Optional[str] = None) -> List[Dict]:
        params = {'farmId': farm_id}
        if start_date:
            params['startDate'] = start_date
        if end_date:
            params['endDate'] = end_date
        return self.client.request('GET', '/api/trpc/financial.getRevenue', params=params)
    
    def get_summary(self, farm_id: int, months: int = 12) -> Dict:
        return self.client.request('GET', '/api/trpc/financial.getSummary',
                                  params={'farmId': farm_id, 'months': months})
    
    def add_expense(self, data: Dict) -> Dict:
        return self.client.request('POST', '/api/trpc/financial.addExpense', data=data)
    
    def add_revenue(self, data: Dict) -> Dict:
        return self.client.request('POST', '/api/trpc/financial.addRevenue', data=data)


class NotificationsAPI:
    def __init__(self, client: FarmKonnectClient):
        self.client = client
    
    def list(self, limit: int = 10, offset: int = 0, read: Optional[bool] = None) -> List[Dict]:
        params = {'limit': limit, 'offset': offset}
        if read is not None:
            params['read'] = read
        return self.client.request('GET', '/api/trpc/notifications.list', params=params)
    
    def mark_as_read(self, notification_id: int) -> Dict:
        return self.client.request('POST', '/api/trpc/notifications.markAsRead',
                                  params={'id': notification_id})
    
    def mark_all_as_read(self) -> Dict:
        return self.client.request('POST', '/api/trpc/notifications.markAllAsRead')
    
    def delete(self, notification_id: int) -> Dict:
        return self.client.request('DELETE', '/api/trpc/notifications.delete',
                                  params={'id': notification_id})
    
    def get_preferences(self) -> Dict:
        return self.client.request('GET', '/api/trpc/notifications.getPreferences')
    
    def update_preferences(self, data: Dict) -> Dict:
        return self.client.request('PUT', '/api/trpc/notifications.updatePreferences', data=data)


# Async API Module Classes (stubs - implement similarly to sync versions)
class AsyncFarmsAPI(FarmsAPI):
    pass

class AsyncCropsAPI(CropsAPI):
    pass

class AsyncLivestockAPI(LivestockAPI):
    pass

class AsyncBreedingAPI(BreedingAPI):
    pass

class AsyncMarketplaceAPI(MarketplaceAPI):
    pass

class AsyncWeatherAPI(WeatherAPI):
    pass

class AsyncFinancialAPI(FinancialAPI):
    pass

class AsyncNotificationsAPI(NotificationsAPI):
    pass
