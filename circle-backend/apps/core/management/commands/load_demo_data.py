from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import transaction
import os


class Command(BaseCommand):
    help = 'Load demo data fixtures for Circle platform'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before loading fixtures',
        )

    def handle(self, *args, **options):
        """
        Загружает все demo данные в правильном порядке:
        1. Пользователи (сферы, специализации, пользователи)
        2. Агентства
        3. Туры (категории, параметры, туры, сессии)
        4. Промокоды и акции
        5. Бронирования
        6. Дополнительные связи
        """
        
        if options['clear']:
            self.stdout.write(
                self.style.WARNING('⚠️  Clearing existing data...')
            )
            # В продакшне здесь можно добавить подтверждение
            self.clear_data()
        
        self.stdout.write(
            self.style.HTTP_INFO('🚀 Loading Circle demo data...')
        )
        
        # Порядок загрузки важен из-за FK зависимостей
        fixtures = [
            ('users_data.json', 'Пользователи, сферы и специализации'),
            ('agencies_data.json', 'Турагентства'), 
            ('tours_data.json', 'Категории туров и параметры'),
            ('tours_full_data.json', 'Туры, сессии и расписания'),
            ('promotions_data.json', 'Промокоды и акции'),
            ('bookings_data.json', 'Бронирования'),
        ]
        
        try:
            with transaction.atomic():
                for fixture_file, description in fixtures:
                    self.stdout.write(f'📂 Загружаю {description}...')
                    
                    # Ищем fixture в приложениях
                    fixture_path = self.find_fixture(fixture_file)
                    if fixture_path:
                        call_command('loaddata', fixture_path, verbosity=0)
                        self.stdout.write(
                            self.style.SUCCESS(f'   ✅ {description} загружены')
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(f'   ⚠️  Fixture {fixture_file} не найден')
                        )
                
                # Дополнительные связи
                self.create_connections()
                
                self.stdout.write('\n' + '='*50)
                self.stdout.write(
                    self.style.SUCCESS('🎉 Все demo данные успешно загружены!')
                )
                self.stdout.write('📊 Что создано:')
                self.stdout.write('   • 5 сфер деятельности')
                self.stdout.write('   • 5 специализаций')
                self.stdout.write('   • 4 тестовых пользователя + админ')
                self.stdout.write('   • 3 турагентства')
                self.stdout.write('   • 5 категорий туров')
                self.stdout.write('   • 5 туров с 7 сессиями')
                self.stdout.write('   • 2 акции и 3 промокода')
                self.stdout.write('   • 6 бронирований в разных статусах')
                self.stdout.write('\n🔗 Админка: http://127.0.0.1:8000/admin/')
                self.stdout.write('🔑 Login: phoenix | Password: 18569874')
                self.stdout.write('='*50)
                        
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Ошибка при загрузке данных: {e}')
            )
            raise

    def find_fixture(self, filename):
        """Ищет fixture файл в директориях приложений"""
        apps = ['users', 'agencies', 'tours', 'bookings']
        
        for app in apps:
            fixture_path = f'apps/{app}/fixtures/{filename}'
            if os.path.exists(fixture_path):
                return fixture_path
        return None

    def create_connections(self):
        """Создает дополнительные связи между пользователями и турами"""
        from apps.users.models import User
        from apps.tours.models import Tour
        
        self.stdout.write('🔗 Создаю связи между пользователями...')
        
        try:
            # Получаем пользователей
            aidar = User.objects.get(username='aidar_dev')
            malika = User.objects.get(username='malika_designer')
            jamshid = User.objects.get(username='jamshid_doctor')
            nodira = User.objects.get(username='nodira_teacher')
            
            # Создаем connections (друзья)
            aidar.connections.add(malika, jamshid)
            malika.connections.add(nodira)
            jamshid.connections.add(nodira)
            
            # Добавляем участников к турам
            chimgan_tour = Tour.objects.get(slug='chimgan-peak-hiking')
            samarkand_tour = Tour.objects.get(slug='samarkand-heritage-tour')
            aydarkul_tour = Tour.objects.get(slug='aydarkul-lake-camp')
            
            chimgan_tour.participants.add(aidar, jamshid)
            samarkand_tour.participants.add(malika, nodira)
            aydarkul_tour.participants.add(aidar, malika)
            
            self.stdout.write(
                self.style.SUCCESS('   ✅ Связи созданы')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.WARNING(f'   ⚠️  Ошибка при создании связей: {e}')
            )

    def clear_data(self):
        """Очищает demo данные (опционально)"""
        from django.apps import apps
        
        # Модели для очистки в обратном порядке зависимостей
        models_to_clear = [
            'bookings.Booking',
            'tours.PromoCode', 
            'tours.Promotion',
            'tours.TourParameterValue',
            'tours.TourSchedule',
            'tours.TourSession',
            'tours.Tour',
            'tours.TourParameterDefinition',
            'tours.TourCategory',
            'agencies.TravelAgency',
            'users.User',  # Оставляем только суперпользователя
            'users.Specialization',
            'users.Sphere',
        ]
        
        for model_path in models_to_clear:
            try:
                app_label, model_name = model_path.split('.')
                model = apps.get_model(app_label, model_name)
                
                if model_name == 'User':
                    # Удаляем всех кроме суперпользователя
                    model.objects.filter(is_superuser=False).delete()
                else:
                    model.objects.all().delete()
                    
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f'Не удалось очистить {model_path}: {e}')
                ) 