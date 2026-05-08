
from django.urls import path
from .views import exportar_csv
urlpatterns = [
    path("reportes/csv/", exportar_csv, name="exportar_csv"),
]
