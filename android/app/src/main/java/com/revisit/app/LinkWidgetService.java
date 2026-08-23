package com.revisit.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class LinkWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new LinkRemoteViewsFactory(this.getApplicationContext());
    }
}

class LinkRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {
    private final Context context;
    private final List<WidgetItemModel> itemList = new ArrayList<>();

    public LinkRemoteViewsFactory(Context context) {
        this.context = context;
    }

    @Override
    public void onCreate() {
        loadData();
    }

    @Override
    public void onDataSetChanged() {
        loadData();
    }

    private void loadData() {
        itemList.clear();
        SharedPreferences prefs = context.getSharedPreferences("revisit_widget_prefs", Context.MODE_PRIVATE);
        String linksJson = prefs.getString("widget_links", "{}");

        try {
            JSONObject root = new JSONObject(linksJson);
            JSONArray links = root.optJSONArray("links");
            if (links != null) {
                for (int i = 0; i < links.length(); i++) {
                    JSONObject obj = links.getJSONObject(i);
                    String id = obj.optString("id", "");
                    String title = obj.optString("title", "Link");
                    String domain = obj.optString("domain", "");
                    String url = obj.optString("url", "");
                    long nextReminderAt = obj.optLong("nextReminderAt", 0);

                    String timeRemaining = "";
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

                    itemList.add(new WidgetItemModel(id, title, domain, url, timeRemaining));
                }
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onDestroy() {
        itemList.clear();
    }

    @Override
    public int getCount() {
        return itemList.size();
    }

    @Override
    public RemoteViews getViewAt(int position) {
        if (position < 0 || position >= itemList.size()) return null;

        WidgetItemModel item = itemList.get(position);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_item);

        views.setTextViewText(R.id.widget_item_title, item.title);
        views.setTextViewText(R.id.widget_item_domain, item.domain);
        views.setTextViewText(R.id.widget_item_time, item.timeRemaining);

        Intent fillInIntent = new Intent();
        fillInIntent.setData(Uri.parse(item.url));
        views.setOnClickFillInIntent(R.id.widget_item_root, fillInIntent);

        return views;
    }

    @Override
    public RemoteViews getLoadingView() {
        return null;
    }

    @Override
    public int getViewTypeCount() {
        return 1;
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public boolean hasStableIds() {
        return true;
    }
}

class WidgetItemModel {
    String id;
    String title;
    String domain;
    String url;
    String timeRemaining;

    WidgetItemModel(String id, String title, String domain, String url, String timeRemaining) {
        this.id = id;
        this.title = title;
        this.domain = domain;
        this.url = url;
        this.timeRemaining = timeRemaining;
    }
}
