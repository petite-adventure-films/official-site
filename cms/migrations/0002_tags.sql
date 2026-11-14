-- Catalog from the tracked WordPress public snapshot; no content migration.
CREATE TABLE tags (id TEXT NOT NULL, kind TEXT NOT NULL CHECK (kind IN ('film', 'event')), name TEXT NOT NULL, PRIMARY KEY (kind, id));
INSERT INTO tags (id, kind, name) VALUES ('153', 'film', 'さようならUR');
INSERT INTO tags (id, kind, name) VALUES ('164', 'film', '木田さんと原発、そして日本');
INSERT INTO tags (id, kind, name) VALUES ('165', 'film', '踊る善福寺');
INSERT INTO tags (id, kind, name) VALUES ('166', 'film', 'ホームレスごっこ');
INSERT INTO tags (id, kind, name) VALUES ('256', 'film', 'インド日記');
INSERT INTO tags (id, kind, name) VALUES ('3', 'film', 'ブライアンと仲間たち');
INSERT INTO tags (id, kind, name) VALUES ('4651', 'film', '日々新');
INSERT INTO tags (id, kind, name) VALUES ('171', 'event', '講演会');
INSERT INTO tags (id, kind, name) VALUES ('177', 'event', 'ワークショップ');
INSERT INTO tags (id, kind, name) VALUES ('181', 'event', '上映会');
INSERT INTO tags (id, kind, name) VALUES ('182', 'event', 'イベント');
INSERT INTO tags (id, kind, name) VALUES ('2515', 'event', 'トークイベント');
INSERT INTO tags (id, kind, name) VALUES ('263', 'event', '反原発美術館');
INSERT INTO tags (id, kind, name) VALUES ('266', 'event', 'ラジオ出演');
INSERT INTO tags (id, kind, name) VALUES ('4723', 'event', '監督トーク');
INSERT INTO tags (id, kind, name) VALUES ('5109', 'event', '講座');
INSERT INTO tags (id, kind, name) VALUES ('5110', 'event', '監督質疑応答');
