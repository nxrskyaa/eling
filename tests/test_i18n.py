"""Test i18n trilingual + langstore."""
import sys

import pytest

sys.path.insert(0, "/home/hatch/workspace/walrus-hackathon/eling")

import i18n
import langstore


def test_key_parity_across_languages():
    base = set(i18n.STRINGS["id"].keys())
    assert base, "bahasa id tidak punya string"
    for lang in ("en", "zh"):
        assert set(i18n.STRINGS[lang].keys()) == base, f"key tidak sinkron: {lang}"


def test_system_prompt_keys_parity():
    base = set(i18n.SYSTEM_PROMPTS["id"].keys())
    for lang in ("en", "zh"):
        assert set(i18n.SYSTEM_PROMPTS[lang].keys()) == base


def test_t_fallback_and_format():
    assert i18n.t("xx", "lang_set") == i18n.t("id", "lang_set")
    assert "123456" in i18n.t("en", "pair_msg", code="123456")
    assert "Flavyn" in i18n.t("zh", "start_intro", name="Flavyn")


def test_system_prompt_per_language():
    id_p = i18n.system_prompt("id", [])
    en_p = i18n.system_prompt("en", [])
    zh_p = i18n.system_prompt("zh", [])
    assert "Bahasa Indonesia" in id_p
    assert "in English" in en_p
    assert "中文" in zh_p
    # memories disuntik ke prompt
    p = i18n.system_prompt("en", [("User likes coffee", 0.1)])
    assert "User likes coffee" in p


def test_langstore_roundtrip(tmp_path, monkeypatch):
    monkeypatch.setattr(langstore, "LANG_FILE", tmp_path / "prefs.json")
    assert langstore.get_lang(999) == "id"  # default
    assert not langstore.has_lang(999)
    assert langstore.set_lang(999, "zh") is True
    assert langstore.get_lang(999) == "zh"
    assert langstore.has_lang(999)
    assert langstore.set_lang(999, "xx") is False
    assert langstore.get_lang(999) == "zh"  # tidak berubah


def test_langstore_survives_reload(tmp_path, monkeypatch):
    monkeypatch.setattr(langstore, "LANG_FILE", tmp_path / "prefs.json")
    langstore.set_lang(111, "en")
    # baca ulang dari file (simulasi restart proses)
    assert langstore.get_lang(111) == "en"
