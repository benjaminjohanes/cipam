-- Grant all permissions to the first admin account (FATJO)
INSERT INTO public.admin_permissions (user_id, permission, granted_by)
VALUES 
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_users', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_articles', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_formations', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_events', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_services', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_categories', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_affiliations', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'view_stats', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_settings', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef'),
  ('58eec673-e3b1-41d8-b8ce-3c93a1e0beef', 'manage_team', '58eec673-e3b1-41d8-b8ce-3c93a1e0beef')
ON CONFLICT (user_id, permission) DO NOTHING;