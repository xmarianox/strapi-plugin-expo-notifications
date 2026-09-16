import React, { useEffect, useState } from "react";

import useQueryParams from "../../utils/useQueryParams";
import Main from "./main";

import { buildReceiversOptions } from "./functions";

import { useFetchClient } from "@strapi/strapi/admin";

export default function HomePageWithData() {
  const { get } = useFetchClient();
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [testToken, setTestToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [receiversCount, setReceiversCount] = useState(0);
  const [segmentation, setSegmentation] = useState({ enabled: false, options: [] });
  const [segment, setSegment] = useState("");
  const [{ query }] = useQueryParams();
  const fetchConfig = async () => {
    const config = await get(`/expo-notifications/get-plugin-config`);
    if (config.data && config.data.testToken) {
      setTestToken(config.data.testToken);
    }
  };
  const fetchSegments = async () => {
    const res = await get(`/expo-notifications/segments`);
    if (res.data) {
      setSegmentation(res.data);
    }
  };
  const fetchRecipients = async () => {
    const segmentQuery = segment ? `?segment=${encodeURIComponent(segment)}` : "";
    const res = await get(`/expo-notifications/recipientsFrom/0${segmentQuery}`);
    const { data } = res;
    const options = buildReceiversOptions(
      data.recipients ? data.recipients : []
    );
    setReceivers(options);
    setReceiversCount(data.count);
  };

  const fetchData = async () => {
    if (isLoading === false) setIsLoading(true);
    let page = 1;
    let pageSize = 10;
    if (query && query.page) {
      if (query.pageSize) {
        pageSize = Number(query.pageSize);
      }
      const res = await get(
        `/expo-notifications/findFrom/?page=${query.page}&pageSize=${pageSize}`
      );
      setNotifications(res.data?.notifications);
      setCount(res.data?.count);
      setIsLoading(false);
    } else {
      const res = await get(
        `/expo-notifications/findFrom/?page=${page}&pageSize=${pageSize}`
      );
      setNotifications(res.data?.notifications);
      setCount(res.data?.count);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchConfig();
    fetchSegments();
  }, [query]);

  useEffect(() => {
    fetchRecipients();
  }, [segment]);

  const refreshNotificationsState = () => {
    fetchData();
  };

  return (
    <div>
      <Main
        notifications={notifications}
        count={count}
        receivers={receivers}
        receiversCount={receiversCount}
        refreshNotificationsState={refreshNotificationsState}
        isLoading={isLoading}
        testToken={testToken}
        segmentation={segmentation}
        segment={segment}
        setSegment={setSegment}
      />
    </div>
  );
}
