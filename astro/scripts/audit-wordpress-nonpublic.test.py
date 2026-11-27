import importlib.util
import json
from pathlib import Path
import unittest
import sys
sys.dont_write_bytecode = True

spec = importlib.util.spec_from_file_location('intake', Path(__file__).with_name('audit-wordpress-nonpublic.py'))
intake = importlib.util.module_from_spec(spec)
spec.loader.exec_module(intake)


class IntakeTest(unittest.TestCase):
    def setUp(self):
        self.record = {'id': 1, 'type': 'post', 'status': 'private', 'slug': 'original',
                       'date': '2020-01-01T10:00:00', 'modified': '2020-01-02T10:00:00',
                       'title': {'raw': 'Private fixture'}, 'content': {'raw': 'first\r\nsecond'}}
        self.xml = b'''<rss xmlns:wp="http://wordpress.org/export/1.2/" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>
        <wp:wxr_version>1.2</wp:wxr_version><item><title>Private fixture</title>
        <wp:post_id>1</wp:post_id><wp:post_type>post</wp:post_type><wp:status>private</wp:status>
        <wp:post_name>original</wp:post_name><wp:post_date>2020-01-01 10:00:00</wp:post_date>
        <wp:post_modified>2020-01-02 10:00:00</wp:post_modified><content:encoded>first\nsecond</content:encoded>
        <wp:postmeta><wp:meta_key>recommend</wp:meta_key><wp:meta_value>1</wp:meta_value></wp:postmeta>
        </item></channel></rss>'''

    def run_audit(self, records=None, xml=None):
        return intake.audit(json.dumps(records if records is not None else [self.record]).encode(), [self.xml if xml is None else xml])

    def test_matches_without_rewriting_private_content_or_status(self):
        result = self.run_audit()
        self.assertEqual(result['counts'], {'draft': 0, 'private': 1})
        self.assertFalse(result['posts'][0]['publish'])
        self.assertEqual(result['posts'][0]['restRecord'], self.record)
        self.assertEqual(result['posts'][0]['meta'], {'recommend': ['1']})
        self.assertEqual(result, self.run_audit())

    def test_rejects_incomplete_or_duplicate_sources(self):
        with self.assertRaisesRegex(ValueError, 'duplicate_rest_id'):
            self.run_audit([self.record, self.record])
        with self.assertRaisesRegex(ValueError, 'incomplete_wxr_coverage'):
            self.run_audit(xml=b'<rss xmlns:wp="http://wordpress.org/export/1.2/"><channel><wp:wxr_version>1.2</wp:wxr_version></channel></rss>')

    def test_rejects_changed_content_and_public_records(self):
        with self.assertRaisesRegex(ValueError, 'rest_wxr_mismatch'):
            self.run_audit(xml=self.xml.replace(b'second', b'changed'))
        self.record['status'] = 'publish'
        with self.assertRaisesRegex(ValueError, 'unexpected_post_type_or_status'):
            self.run_audit()

    def test_rejects_entity_declarations(self):
        with self.assertRaisesRegex(ValueError, 'xml_entities_not_allowed'):
            self.run_audit(xml=b'<!DOCTYPE rss [<!ENTITY x "secret">]>' + self.xml)


if __name__ == '__main__':
    unittest.main()
