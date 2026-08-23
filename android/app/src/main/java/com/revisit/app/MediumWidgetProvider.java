package com.revisit.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class MediumWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_medium);

        SharedPreferences prefs = context.getSharedPreferences("revisit_widget_prefs", Context.MODE_PRIVATE);
        String linksJson = prefs.getString("widget_links", "{}");

        int count = 0;
        try {
            JSONObject root = new JSONObject(linksJson);
            JSONArray links = root.optJSONArray("links");
            if (links != null) {
                count = links.length();
            }
        } catch (Exception ignored) {}

        views.setTextViewText(R.id.widget_medium_count, String.valueOf(count));

        if (count == 0) {
            views.setViewVisibility(R.id.widget_medium_empty, View.VISIBLE);
            views.setViewVisibility(R.id.widget_medium_list, View.GONE);
        } else {
            views.setViewVisibility(R.id.widget_medium_empty, View.GONE);
            views.setViewVisibility(R.id.widget_medium_list, View.VISIBLE);

            Intent serviceIntent = new Intent(context, LinkWidgetService.class);
            serviceIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            serviceIntent.setData(Uri.parse(serviceIntent.toUri(Intent.URI_INTENT_SCHEME)));
            views.setRemoteAdapter(R.id.widget_medium_list, serviceIntent);
            views.setEmptyView(R.id.widget_medium_list, R.id.widget_medium_empty);

            Intent clickIntent = new Intent(Intent.ACTION_VIEW);
            PendingIntent clickPendingIntent = PendingIntent.getActivity(
                context,
                0,
                clickIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE
            );
            views.setPendingIntentTemplate(R.id.widget_medium_list, clickPendingIntent);
        }

        Intent openAppIntent = new Intent(context, MainActivity.class);
        PendingIntent openAppPendingIntent = PendingIntent.getActivity(
            context,
            appWidgetId,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_medium_add_btn, openAppPendingIntent);
        views.setOnClickPendingIntent(R.id.widget_medium_header, openAppPendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_medium_list);
    }
}
