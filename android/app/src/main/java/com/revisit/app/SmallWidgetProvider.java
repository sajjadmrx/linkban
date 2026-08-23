package com.revisit.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class SmallWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_small);

        SharedPreferences prefs = context.getSharedPreferences("revisit_widget_prefs", Context.MODE_PRIVATE);
        String linksJson = prefs.getString("widget_links", "{}");

        String title = "No upcoming links";
        String domain = "Revisit";
        String timeRemaining = "";
        String targetUrl = null;

        try {
            JSONObject root = new JSONObject(linksJson);
            JSONArray links = root.optJSONArray("links");
            if (links != null && links.length() > 0) {
                JSONObject first = links.getJSONObject(0);
                title = first.optString("title", "Link");
                domain = first.optString("domain", "revisit");
                targetUrl = first.optString("url", null);

                long nextReminderAt = first.optLong("nextReminderAt", 0);
                long diffMs = nextReminderAt - System.currentTimeMillis();

                if (diffMs <= 0) {
                    timeRemaining = "Due";
                } else {
                    long diffMins = diffMs / (60 * 1000);
                    if (diffMins < 60) {
                        timeRemaining = Math.max(1, diffMins) + "m";
                    } else {
                        long diffHours = diffMs / (60 * 60 * 1000);
                        if (diffHours < 24) {
                            timeRemaining = diffHours + "h";
                        } else {
                            long diffDays = diffMs / (24 * 60 * 60 * 1000);
                            timeRemaining = diffDays + "d";
                        }
                    }
                }
            }
        } catch (Exception ignored) {}

        views.setTextViewText(R.id.widget_small_title, title);
        views.setTextViewText(R.id.widget_small_domain, domain);
        views.setTextViewText(R.id.widget_small_badge, timeRemaining);

        PendingIntent pendingIntent;
        if (targetUrl != null && !targetUrl.isEmpty()) {
            Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl));
            browserIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                browserIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
        } else {
            Intent appIntent = new Intent(context, MainActivity.class);
            pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                appIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
        }

        views.setOnClickPendingIntent(R.id.widget_small_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
