from django.db import models
from apps.users.models import User, Sphere, Specialization
from apps.tours.models import Tour


class Community(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    sphere = models.ForeignKey(Sphere, on_delete=models.SET_NULL, null=True, blank=True)
    specialization = models.ForeignKey(Specialization, on_delete=models.SET_NULL, null=True, blank=True)
    avatar = models.ImageField(upload_to="community_avatars/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    members = models.ManyToManyField(User, through="CommunityMembership", related_name="communities")

    def __str__(self):
        return self.name


class CommunityMembership(models.Model):
    ROLE_CHOICES = [
        ("member", "Member"),
        ("moderator", "Moderator"),
        ("owner", "Owner"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    community = models.ForeignKey(Community, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")

    class Meta:
        unique_together = ("user", "community")

    def __str__(self):
        return f"{self.user.username} in {self.community.name}"


class CommunityChat(models.Model):
    community = models.OneToOneField(Community, on_delete=models.CASCADE, related_name="chat")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"Chat for {self.community.name}"


class CommunityPopularTour(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="popular_tours")
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    rank = models.PositiveIntegerField()  # 1, 2, 3

    class Meta:
        unique_together = ("community", "rank")

    def __str__(self):
        return f"{self.community.name} - {self.tour.title} (Rank {self.rank})"