-- AC-051.2: Analytics by marketplace function
CREATE OR REPLACE FUNCTION analytics_by_marketplace(
  p_tenant_id UUID,
  p_date_from TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
  p_date_to TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE(
  marketplace TEXT,
  captured_count BIGINT,
  sent_count BIGINT,
  clicks_count BIGINT,
  conversion_rate FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    co.marketplace,
    COUNT(DISTINCT co.id)::BIGINT as captured_count,
    COUNT(DISTINCT ro.id)::BIGINT as sent_count,
    COUNT(DISTINCT lc.id)::BIGINT as clicks_count,
    CASE 
      WHEN COUNT(DISTINCT lc.id) > 0 
      THEN ROUND((COUNT(DISTINCT CASE WHEN lc.converted THEN lc.id END)::FLOAT / COUNT(DISTINCT lc.id)) * 100, 2)
      ELSE 0
    END::FLOAT as conversion_rate
  FROM captured_offers co
  LEFT JOIN replicated_offers ro ON co.id = ro.offer_id AND ro.tenant_id = p_tenant_id
  LEFT JOIN link_clicks lc ON ro.id = lc.offer_id AND lc.tenant_id = p_tenant_id
  WHERE co.tenant_id = p_tenant_id
    AND co.captured_at >= p_date_from
    AND co.captured_at <= p_date_to
  GROUP BY co.marketplace
  ORDER BY captured_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- AC-051.4: Peak offering times function
CREATE OR REPLACE FUNCTION analytics_peak_times(
  p_tenant_id UUID,
  p_date_from TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
  p_date_to TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE(
  hour_of_day INT,
  offer_count BIGINT,
  percentage FLOAT
) AS $$
DECLARE
  v_total_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_total_count
  FROM captured_offers
  WHERE tenant_id = p_tenant_id
    AND captured_at >= p_date_from
    AND captured_at <= p_date_to;

  RETURN QUERY
  SELECT
    EXTRACT(HOUR FROM captured_at)::INT as hour_of_day,
    COUNT(*)::BIGINT as offer_count,
    ROUND((COUNT(*)::FLOAT / NULLIF(v_total_count, 0)) * 100, 2)::FLOAT as percentage
  FROM captured_offers
  WHERE tenant_id = p_tenant_id
    AND captured_at >= p_date_from
    AND captured_at <= p_date_to
  GROUP BY EXTRACT(HOUR FROM captured_at)
  ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql STABLE;
