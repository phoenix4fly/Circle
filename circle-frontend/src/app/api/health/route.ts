import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Здесь можно добавить проверки:
    // - Соединение с backend API
    // - Проверка памяти
    // - Проверка дискового пространства
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'circle-frontend',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
      },
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 