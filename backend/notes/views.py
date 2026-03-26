from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings
import boto3
import uuid
import os

from .models import Note
from .serializers import NoteSerializer


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(detail=False, methods=["post"], url_path="upload-s3")
    def upload_to_s3(self, request):
        """Direct S3 upload endpoint — demonstrates S3 integration."""
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            s3 = boto3.client(
                "s3",
                aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
                region_name=os.environ.get("AWS_S3_REGION_NAME", "us-east-1"),
            )
            bucket = os.environ.get("AWS_STORAGE_BUCKET_NAME")
            key = f"direct-uploads/{uuid.uuid4()}_{file.name}"
            s3.upload_fileobj(file, bucket, key, ExtraArgs={"ContentType": file.content_type})
            url = f"https://{bucket}.s3.amazonaws.com/{key}"
            return Response({"url": url, "key": key}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
