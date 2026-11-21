import importlib.util
import pathlib
import unittest

spec = importlib.util.spec_from_file_location("samples", pathlib.Path(__file__).with_name("prepare-director-samples.py"))
samples = importlib.util.module_from_spec(spec)
spec.loader.exec_module(samples)


class ReviewCopies(unittest.TestCase):
    def test_color_requires_explicit_approval(self):
        with self.assertRaises(ValueError):
            samples.body('<p><span style="color: #0000ff;">本文</span></p>', {})

    def test_text_links_and_images_survive_simplification(self):
        doc, warnings = samples.body('<p><span style="color: #0000ff;"><strong>本文</strong></span><a href="https://example.com/">リンク</a><img src="https://example.com/a.jpg" alt="説明" />後文</p>', {'https://example.com/a.jpg': 'asset_a'}, True)
        blocks = doc['doc']['content']
        self.assertEqual([n['type'] for n in blocks], ['paragraph', 'assetImage', 'paragraph'])
        self.assertEqual(blocks[0]['content'][0], {'type': 'text', 'text': '本文', 'marks': [{'type': 'bold'}]})
        self.assertEqual(blocks[0]['content'][1]['marks'][0]['attrs']['href'], 'https://example.com/')
        self.assertEqual(blocks[1]['attrs']['alt'], '説明')
        self.assertEqual(blocks[2]['content'][0]['text'], '後文')
        self.assertEqual(warnings[0]['kind'], 'simplified-color')

    def test_unknown_elements_and_unverified_images_stop(self):
        for html in ['<iframe></iframe>', '<p><img src="https://example.com/a.jpg" /></p>', '<p style="text-align:right">x</p>', '<p><a href="javascript:alert(1)">x</a></p>']:
            with self.assertRaises(ValueError):
                samples.body(html, {}, True)

    def test_event_link_is_retained_in_text_field(self):
        self.assertEqual(samples.plain('<p><a href="https://example.com/">主催者</a><br />備考</p>'), '主催者（https://example.com/）\n備考')

    def test_identity_is_stable_and_type_specific(self):
        self.assertEqual(samples.stable_id('blogs/1'), samples.stable_id('blogs/1'))
        self.assertNotEqual(samples.stable_id('blogs/1'), samples.stable_id('events/1'))


if __name__ == '__main__':
    unittest.main()
