import requests
from django.core.management.base import BaseCommand
from databaseForRecords.models import ExercisesFromAPI
from urllib.parse import urlparse, parse_qs

class Command(BaseCommand):
    help = "Fetch all exercises from ExerciseDB API and save them to the database."

    def handle(self, *args, **kwargs):
        url = "https://exercisedb-api.vercel.app/api/v1/exercises"
        params = {"offset": 0, "limit": 25}

        total_saved = 0

        while True:
            response = requests.get(url, params=params)
            data = response.json()

            for item in data["data"]:
                # create or update to avoid duplicates
                obj, created = ExercisesFromAPI.objects.update_or_create(
                    exercise_id=item["exerciseId"],
                    defaults={
                        "name": item["name"],
                        "gif_url": item["gifUrl"],
                        "target_muscles": item["targetMuscles"],
                        "body_parts": item["bodyParts"],
                        "equipments": item["equipments"],
                        "secondary_muscles": item["secondaryMuscles"],
                        "instructions": item["instructions"],
                    },
                )
                if created:
                    total_saved += 1

            self.stdout.write(self.style.SUCCESS(
                f"Fetched page {data['metadata']['currentPage']} - saved {total_saved} new exercises so far."
            ))

            next_page = data["metadata"]["nextPage"]
            if not next_page:
                break

            # extract new offset from nextPage URL
            query = parse_qs(urlparse(next_page).query)
            params["offset"] = int(query["offset"][0])

        self.stdout.write(self.style.SUCCESS(f"✅ Done! Total saved: {ExercisesFromAPI.objects.count()}"))
