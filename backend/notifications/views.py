from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """
    List unread notifications for the current user.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Optional: query parameter to show all vs unread
        unread_only = self.request.query_params.get('unread_only', 'true').lower() == 'true'
        qs = Notification.objects.filter(user=self.request.user)
        if unread_only:
            qs = qs.filter(is_read=False)
        return qs


class NotificationMarkReadView(APIView):
    """
    Mark a specific notification as read.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'success', 'id': pk})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class NotificationMarkAllReadView(APIView):
    """
    Mark all notifications for the user as read.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'success'})
