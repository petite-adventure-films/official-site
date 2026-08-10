export const keyMessages = [
  {
    ur: '人は、ふれあって育つ。UR賃貸住宅',
    residents: 'つながりを壊さないで<br>大家(UR)さん！',
  },
  {
    ur: 'ふるさとになる住宅',
    residents: '終の棲家と<br>思っていたのに…',
  },
  {
    ur: 'やさしさにふれる住宅',
    residents: '大家(UR)さんから<br>立ち退き訴訟！？',
  },
] as const;

export const urTimeline = [
  {
    year: 1955,
    logo: 'ur_logo_1.png',
    name: '日本住宅公団',
    description: '大都市圏の深刻な住宅不足解消のために設立',
  },
  {
    year: 1981,
    logo: 'ur_logo_2.png',
    name: '住宅・都市整備公団',
    description: '全国各地に団地建設<br>ニュータウンの計画や建設<br>都市再開発事業',
  },
  {
    year: 1991,
    logo: 'ur_logo_3.png',
    name: '都市基盤整備公団',
    description: '<strong>高幡台団地73号棟<br>耐震改修を検討</strong>',
  },
  {
    year: 2004,
    logo: 'ur_logo_4.png',
    name: '都市再生機構',
    description:
      '民営化へ…？<br>UR賃貸住宅再生・再編計画<br>既存住宅8万戸を削減<br><strong>高幡台団地73号棟<br>取り壊し決定</strong>',
  },
] as const;

export const takahatadai73Timeline: {
  [key: number]: {
    [key: number]: {
      [key: number]: {
        display_default: boolean;
        events: {
          day?: number | string;
          ur?: string;
          residents?: string;
          materials?: {
            type: 'document' | 'youtube';
            name: string;
            path?: string;
            url?: string;
          }[];
        }[];
      };
    };
  };
} = {
  1: {
    1996: {
      7: {
        display_default: true,
        events: [
          {
            ur: '阪神淡路大震災を受け、UR技術検討委員会で住宅耐震化協議を開始',
          },
        ],
      },
    },
    2003: {
      8: {
        display_default: true,
        events: [
          {
            ur: '都市基盤整備公団東京支社（URの前身）で、73号棟の耐震改修を検討。検討案では、工法の違うA,B,Cの3案が検討されていた。',
          },
        ],
      },
    },
    2005: {
      3: {
        display_default: false,
        events: [
          {
            ur: 'UR、高幡台団地73号棟1階店舗部分の耐震改修工事を開始',
          },
        ],
      },
    },
    2006: {
      4: {
        display_default: true,
        events: [
          {
            ur: 'URが73号棟住民に、73号棟改修のお知らせを配布。73号棟は「平成21年度までに耐震改修等実施してまいります」と約束',
            materials: [
              {
                type: 'document',
                name: 'Ｈ18年お知らせ.pdf',
              },
            ],
          },
        ],
      },
    },
    2007: {
      2: {
        display_default: false,
        events: [
          {
            ur: 'UR、第6回東日本耐震化推進会議で、73号棟除却方針を決定。4月に理事長承認',
          },
        ],
      },
      12: {
        display_default: false,
        events: [
          {
            ur: '独立行政法人整理合理化計画が内閣で閣議決定される',
          },
          {
            day: 25,
            ur: 'URより高幡台団地住民へ、東日本支社サポート業務部長名にて「高幡台団地はストック活用類型分類」とのお知らせ文書。ここには73号棟除却に関する記述は一切なし',
          },
          {
            day: 26,
            ur: 'UR賃貸住宅ストック再生・再編方針発表。同日にURは第10回東日本耐震化推進会議で、73号棟の除却を正式決定',
          },
        ],
      },
    },
    2008: {
      3: {
        display_default: false,
        events: [
          {
            ur: 'URが、高幡台団地自治会運営委員会に除却方針を説明。自治会運営委員会はこの説明を受け、73号棟住民に説明することなく「除却やむなし」の結論に。これを5日付高幡台団地自治会広報号外で公表',
          },
        ],
      },
    },
  },
  2: {
    2008: {
      3: {
        display_default: true,
        events: [
          {
            day: 7,
            ur: 'UR、73号棟住民に73号棟除却決定と説明会開催を伝えるお知らせ配布',
          },
          {
            day: 29,
            ur: 'UR、七生公会堂で73号棟住民への説明会を実施。当時の居住者204世帯中168世帯参加。説明会は紛糾し、URは住民の要求に応えて4月18日・19日に追加説明会を開催',
            materials: [
              {
                type: 'document',
                name: '取扱いについて.pdf',
              },
              {
                type: 'document',
                name: '耐震改修の断念について.pdf',
              },
            ],
          },
        ],
      },
      4: {
        display_default: true,
        events: [
          {
            day: 25,
            residents:
              '「73号棟に住み続けたい住民の会」（以下、住民の会）発足。住民の会、URに対する署名「73号棟除却計画の撤回と速やかな耐震対策の実施を要望します」集めを開始',
            materials: [
              {
                type: 'document',
                name: '73号棟署名簿UR向け.pdf',
              },
            ],
          },
        ],
      },
      6: {
        display_default: false,
        events: [
          {
            day: 10,
            residents: '住民の会ニュース1 創刊号',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース1_創刊号.pdf',
              },
            ],
          },
          {
            day: 18,
            residents:
              '住民の会、署名146筆（当時の73号棟居住者の過半数に相当）をUR東日本支社に提出',
          },
        ],
      },
      7: {
        display_default: false,
        events: [
          {
            day: 10,
            residents: '住民の会ニュース2',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース2.pdf',
              },
            ],
          },
        ],
      },
      8: {
        display_default: false,
        events: [
          {
            day: 1,
            residents: '住民の会ニュース3',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース3.pdf',
              },
            ],
          },
        ],
      },
      9: {
        display_default: false,
        events: [
          {
            day: 1,
            residents: '住民の会ニュース4',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース4.pdf',
              },
            ],
          },
          {
            day: 8,
            ur: 'URが日野市に73号棟問題を説明。日野市は減築をしてでも73号棟を残してほしいと要望',
          },
          {
            day: 19,
            residents:
              '住民の会、UR東日本支社に対し情報公開法に基づく、18項目にのぼる情報開示を請求（9月30日に正式に受理となる）',
            materials: [
              {
                type: 'document',
                name: '情報開示内容全体経過一覧.xls',
              },
            ],
          },
        ],
      },
      10: {
        display_default: false,
        events: [
          {
            day: 5,
            residents: '住民の会ニュース5',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース5.pdf',
              },
            ],
          },
          {
            day: 20,
            residents:
              '自由法曹団が、UR住宅除却方針撤回を求める決議、2009年1月29日に耐震改修を求める決議',
          },
          {
            day: 30,
            ur: 'UR、情報開示を決定。構造設計図は表紙以外66ページ全部が黒塗り。その他も一部黒塗りや不開示など不誠実な対応',
          },
        ],
      },
      11: {
        display_default: false,
        events: [
          {
            day: 3,
            residents: '住民の会ニュース6',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース6.pdf',
              },
            ],
          },
          {
            day: 15,
            residents: '住民の会ニュース7',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース7.pdf',
              },
            ],
          },
          {
            day: 30,
            residents:
              '「73号棟を応援する有志の会」が結成される。その後「高幡台団地を考える会」に発展し活動',
          },
        ],
      },
      12: {
        display_default: false,
        events: [
          {
            day: 3,
            residents:
              '住民の会、9月30日の情報開示の結果に対し、UR東日本支社に異議申立て。12月18日、新たに7項目の第2次情報開示請求',
          },
          {
            day: 7,
            residents:
              '弁護士と建築家による、73号棟現地調査と住民懇談会が開催される。弁護士と建築専門家20名以上が参加',
          },
          {
            day: 9,
            ur: '日野市議会で、市長が73号棟について「減築をしても残してほしい」と表明',
          },
          {
            day: 20,
            residents: '住民の会ニュース8',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース8.pdf',
              },
            ],
          },
        ],
      },
    },
    2009: {
      1: {
        display_default: false,
        events: [
          {
            day: 18,
            residents: '住民の会ニュース9',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース9.pdf',
              },
            ],
          },
        ],
      },
      2: {
        display_default: false,
        events: [
          {
            day: 20,
            residents: '住民の会ニュース10',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース10.pdf',
              },
            ],
          },
        ],
      },
      3: {
        display_default: false,
        events: [
          {
            day: 5,
            residents:
              '住民の会、日野市議会に「高幡台団地73号棟の存続と必要な耐震対策の実施を求める」請願を提出。自民、民主、公明、共産など議会全会派6名が紹介議員となる',
            materials: [
              {
                type: 'document',
                name: '日野市議会請願書名.pdf',
              },
            ],
          },
          {
            day: 12,
            residents:
              '住民の会、「73号棟を残してください」と題した手記集を、日野市議会全議員に手渡し、請願採択を求める',
            materials: [
              {
                type: 'document',
                name: '高幡台団地住民の手記.pdf',
              },
            ],
          },
          {
            day: 25,
            residents: '住民の会ニュース11',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース11.pdf',
              },
            ],
          },
          {
            day: 26,
            residents:
              '自由法曹団による国会要請行動に参加。自由法曹団による意見書「UR賃貸住宅の除却方針を撤回し修繕義務の履行を求める」（4月1日付）をもって、弁護士とともに各党国会議員に陳情。11月26日にも再陳情',
          },
        ],
      },
      5: {
        display_default: false,
        events: [
          {
            day: 28,
            ur: '日野市長がURに「73号棟の減築による耐震対策等の実施について」と題したお願い文書を提出',
          },
        ],
      },
      6: {
        display_default: true,
        events: [
          {
            day: 6,
            residents:
              '住民の会、UR東日本支社と第1回「話し合い」。テーマは「なぜ北側から改修できないか」。URは73号棟設計図の一部を示したが、説明後にすべて回収。73号棟の耐震改修工事について、「居つき工事が前提」等の6項目の条件が初めて示される',
          },
          {
            day: 8,
            residents:
              '住民の会、「73号棟を残してください」と題した手記集を、日野市議会全議員に手渡し、請願採択を求める',
            materials: [
              {
                type: 'document',
                name: '高幡台団地住民の手記.pdf',
              },
            ],
          },
        ],
      },
      9: {
        display_default: false,
        events: [
          {
            day: 5,
            residents: '住民の会ニュース 特別号',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース_特別号.pdf',
              },
            ],
          },
          {
            day: 27,
            residents:
              '住民の会、UR東日本支社と第2回「話し合い」。URが横浜・奈良北団地で制震工法を使った改修を行ったことを知った住民が、なぜ73号棟では制震工法が適用できないのか説明を求める。初めて、「73号棟のエキスパンションジョイントが狭いので、耐震工法が適用できない」との説明あり',
          },
        ],
      },
      11: {
        display_default: true,
        events: [
          {
            day: 17,
            ur: '73号棟住民のうち5月起算の契約者に、URから「更新拒絶」の内容証明郵便が送付される。以後、契約期日の6か月前に順次内容証明到着（6か月前に送達することが法律で定められている）',
            materials: [
              {
                type: 'document',
                name: '更新拒絶事前連絡.pdf',
              },
            ],
          },
        ],
      },
    },
    2010: {
      2: {
        display_default: true,
        events: [
          {
            day: '末',
            residents: '住民の会、73号棟のベランダに黄色い旗を掲げる。団地内の支援者宅にも掲示',
          },
        ],
      },
      3: {
        display_default: false,
        events: [
          {
            day: 26,
            residents:
              '住民の会、UR東日本支社と第3回「話し合い」。住民側の要求に、URは初めて構造図を開示したが、持ってきたのは66ページ中42ページのみ。3月29日になって改めて全面開示された',
          },
        ],
      },
      5: {
        display_default: false,
        events: [
          {
            day: 18,
            residents:
              '衆院国土交通委員会で、73号棟問題が取り上げられる。共産党・穀田恵二議員が質問',
          },
        ],
      },
      6: {
        display_default: false,
        events: [
          {
            day: 20,
            residents: '住民の会ニュース12',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース12.pdf',
              },
            ],
          },
          {
            day: 27,
            ur: 'TBSテレビ「噂の東京マガジン」で、73号棟問題が放送される',
          },
        ],
      },
      7: {
        display_default: false,
        events: [
          {
            day: 18,
            residents: '住民の会ニュース_夏祭り臨時号',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース_夏祭り臨時号.pdf',
              },
            ],
          },
          {
            day: 30,
            residents: '住民の会ニュース13',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース13.pdf',
              },
            ],
          },
        ],
      },
      8: {
        display_default: true,
        events: [
          {
            day: 6,
            ur: '7月起算の73号棟住民2人に、URより契約終了確認と住宅返還催告が送付される。以後5人に順次送付される',
            materials: [
              {
                type: 'document',
                name: '更新拒絶通知.pdf',
              },
            ],
          },
          {
            day: 11,
            residents:
              '73号棟住民、東京法務局に家賃供託を開始。以後家賃の自動引き落としを拒否された住民は、毎月の家賃供託をつづける',
          },
        ],
      },
      9: {
        display_default: false,
        events: [
          {
            day: 5,
            residents: '住民の会ニュース14',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース14.pdf',
              },
            ],
          },
        ],
      },
      10: {
        display_default: false,
        events: [
          {
            day: 12,
            ur: 'UR、高幡台団地住民に対し、73号棟1階店舗部分の代替施設設置工事説明会を開催。翌日から73号棟前の樹木を伐採、広場を閉鎖して代替施設の工事を開始',
          },
        ],
      },
      11: {
        display_default: false,
        events: [
          {
            day: 7,
            residents: '住民の会ニュース15',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース15.pdf',
              },
            ],
          },
        ],
      },
      12: {
        display_default: false,
        events: [
          {
            day: 27,
            residents: '住民の会ニュース16',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース16.pdf',
              },
            ],
          },
        ],
      },
    },
  },
  3: {
    2011: {
      1: {
        display_default: false,
        events: [
          {
            day: 21,
            ur: 'UR、73号棟住民に対し、建物明け渡し訴訟を東京地裁立川支部に起こす',
            materials: [
              {
                type: 'document',
                name: '訴状全文.pdf',
              },
            ],
          },
        ],
      },
      2: {
        display_default: false,
        events: [
          {
            day: 5,
            residents:
              '住民の会、建築家グループと共催で、「高幡台団地を考えるワークショップ」（第1回）を開催。同日、裁判所より住民に訴状が届く',
          },
          {
            day: 25,
            residents:
              '住民の会、インターネットTV「住まいるチャンネル」に出演。建築家摺木勉、住民の会より村田栄法、中川京子が出演',
          },
        ],
      },
      3: {
        display_default: true,
        events: [
          {
            day: 7,
            residents: '第1回裁判、住民側の答弁書提出。URの訴状に対し全面的に争うことを表明',
          },
          {
            day: 11,
            ur: '東日本大震災。73号棟では、窓ガラスが割れたり、エキスパンションジョイントのカバーが破損するなどの被害があったが、建物本体に影響を与える被害はなかった',
          },
          {
            day: 21,
            residents:
              '「住まいの貧困に取り組むネットワーク」2周年の集いにて、映画『さようならUR』（早川由美子監督）完成上映',
          },
          {
            day: 22,
            residents: '住民の会ニュース17',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース17.pdf',
              },
            ],
          },
        ],
      },
      4: {
        display_default: false,
        events: [
          {
            day: 10,
            ur: 'TBS「噂の東京マガジン」が2回目の放送。73号棟問題の裁判等、その後の経過を伝える',
          },
        ],
      },
      5: {
        display_default: false,
        events: [
          {
            day: 9,
            residents:
              '第2回裁判、住民第1準備書面提出。住民にとって73号棟は「終の棲家」。耐震改修はURの責任と主張',
          },
          {
            day: 28,
            residents:
              '「高幡台団地を考えるワークショップ」（第2回）を団地内で開催。73号棟積極活用提案の第1次案発表、映画『さようならUR』が団地内で初めて上映される',
          },
        ],
      },
      7: {
        display_default: false,
        events: [
          {
            day: 12,
            residents:
              '第3回裁判。この回から裁判官3人による合議制となる。UR側、第1準備書面提出。2003年（平成15年）73号棟の耐震改修の検討をしていた内容（平成15年検討）を、初めて明らかにした。住民側、畦地豊彦意見陳述。',
          },
          {
            day: 23,
            residents: '住民の会ニュース18',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース18.pdf',
              },
            ],
          },
        ],
      },
      9: {
        display_default: false,
        events: [
          {
            day: 13,
            residents:
              '考える会、裁判所あて「73号棟の存続を求める」署名、172筆提出。その後追加で提出し、総計200筆を超えた',
          },
          {
            day: 15,
            residents:
              '第4回裁判。住民側、第2、第3準備書面提出。URによる説明経過とその問題点、借地借家法による正当事由の欠如を指摘。改修費用7.5億円の根拠などの釈明を求める。中川京子意見陳述',
          },
        ],
      },
      10: {
        display_default: false,
        events: [
          {
            day: 5,
            residents: '住民の会ニュース19',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース19.pdf',
              },
            ],
          },
          {
            day: 27,
            residents:
              '第5回裁判。UR側、第2準備書面提出。住民側の求釈明に対する回答とのことだが、まともに答えず。住民側、建築家・摺木勉の意見書＝制震工法による73号棟の改修方法の検討結果＝を提出。村田栄法意見陳述',
          },
        ],
      },
      12: {
        display_default: false,
        events: [
          {
            day: 22,
            residents:
              '第6回裁判。UR側、第3準備書面提出。住民側、第4準備書面提出。UR側、住民側の主張を全面的に否定。住民側、URの説明の不十分さを指摘。中川京子意見陳述',
          },
        ],
      },
    },
    2012: {
      1: {
        display_default: false,
        events: [
          {
            day: 28,
            residents: '支援団体ら、「73号棟問題から公営公共住宅を考える集い」を日野市内で開催',
          },
        ],
      },
      2: {
        display_default: false,
        events: [
          {
            day: 18,
            residents:
              '支援団体ら、「73号棟のたたかい連帯集会」を都内で開催。新建築家技術家集団による、「高幡台団地センター高層住棟 73号棟積極活用計画」が発表される',
            materials: [
              {
                type: 'document',
                name: '積極活用案120218.pdf',
              },
            ],
          },
          {
            day: 23,
            residents:
              '第7回裁判。UR側、第4準備書面提出。摺木改修案への反論意見書を提出。住民側、第5準備書面提出。多くの住民が転居したのは偽りの情報に誤導されたもの。栗原明意見陳述',
          },
        ],
      },
      3: {
        display_default: false,
        events: [
          {
            day: 29,
            residents:
              '第8回裁判。UR側、第5準備書面提出。耐震改修は一戸の移転も行わせないのが基本を繰り返す。住民側、奈良北団地の資料提出を求める。KT意見陳述',
          },
        ],
      },
      5: {
        display_default: false,
        events: [
          {
            day: 3,
            residents: '住民の会ニュース20',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース20.pdf',
              },
            ],
          },
          {
            day: 17,
            residents: '第9回裁判。住民側、第6準備書面提出。URの社会的使命を指摘。MK意見陳述',
          },
        ],
      },
      7: {
        display_default: false,
        events: [
          {
            day: 4,
            residents:
              '第10回裁判。住民側、第7準備書面提出。UR第4準備書面（摺木改修案反論）への再反論',
          },
        ],
      },
      8: {
        display_default: false,
        events: [
          {
            day: 25,
            residents: '住民の会ニュース21',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース21.pdf',
              },
            ],
          },
          {
            day: 30,
            residents:
              '第11回裁判。住民側、民法学者として早稲田大学教授吉田克己、「国民の住まいを守る全国連絡会」から代表幹事の坂庭国晴両氏の意見書提出',
          },
        ],
      },
      9: {
        display_default: true,
        events: [
          {
            day: 1,
            residents: '支援団体ら、七生公会堂にて「高幡台団地73号棟裁判と連帯するつどい」',
          },
          {
            day: 13,
            residents:
              '第12回裁判、証人尋問。午前10時から夕方までの集中証拠調べ 。UR側2人、住民側から建築家・摺木勉と住民2人（村田栄法、畦地笙子）が証言',
          },
        ],
      },
      10: {
        display_default: true,
        events: [
          {
            day: 15,
            ur: '裁判所による和解意向聴取。URからは、当初住民に示された移転条件そのままの和解案が示される',
          },
        ],
      },
      11: {
        display_default: true,
        events: [
          {
            day: 15,
            residents:
              '住民側、裁判所へ10月15日の和解条件では納得できないと連絡。これを受け、裁判所は和解案の修正を求める',
          },
          {
            day: 30,
            residents:
              '住民側、UR側とも裁判所へ最終準備書面提出。住民側はUR側の最終準備書面に反論する第10準備書面提出（12月12日）',
          },
        ],
      },
      12: {
        display_default: false,
        events: [
          {
            day: 12,
            residents: '住民の会ニュース22',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース22.pdf',
              },
            ],
          },
        ],
      },
    },
    2013: {
      2: {
        display_default: false,
        events: [
          {
            day: 28,
            residents: '住民の会ニュース23',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース23.pdf',
              },
            ],
          },
        ],
      },
      3: {
        display_default: true,
        events: [
          {
            day: 24,
            residents: '住民の会ニュース24',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース24.pdf',
              },
            ],
          },
          {
            day: 28,
            residents:
              '東京地裁立川支部にて、三村晶子裁判長より判決の言い渡し。UR側の主張を全面的に認め、住民側の主張を一切認めない、不当判決だった',
            materials: [
              {
                type: 'document',
                name: '20130328_UR判決.pdf',
              },
              {
                type: 'youtube',
                name: '判決後の報告集会動画',
                url: 'https://www.youtube-nocookie.com/watch?v=dDI5cxmVnIQ',
              },
            ],
          },
        ],
      },
      4: {
        display_default: false,
        events: [
          {
            day: 10,
            residents: '住民側控訴。同時に、立ち退き強制執行停止申し立て（18日執行停止決定）',
          },
        ],
      },
      6: {
        display_default: false,
        events: [
          {
            day: 21,
            residents: '東京高裁にて和解交渉（不調）',
          },
        ],
      },
      7: {
        display_default: false,
        events: [
          {
            day: 4,
            residents: '東京高裁にて和解交渉（不調）',
          },
          {
            day: 17,
            residents: '東京高裁第1回口頭弁論',
          },
        ],
      },
      10: {
        display_default: false,
        events: [
          {
            day: 2,
            residents: '東京高裁第2回口頭弁論',
          },
          {
            day: 17,
            residents: '和解交渉',
          },
        ],
      },
      11: {
        display_default: false,
        events: [
          {
            day: 1,
            residents: '和解交渉',
          },
          {
            day: 18,
            residents: '和解交渉',
          },
        ],
      },
      12: {
        display_default: false,
        events: [
          {
            day: 25,
            residents:
              '和解成立（和解内容は2014年1月10日発行の、住民の会ニュース記載の弁護団声明を参照）',
            materials: [
              {
                type: 'document',
                name: '住民の会ニュース28_最終号.pdf',
              },
            ],
          },
        ],
      },
    },
    2014: {
      1: {
        display_default: false,
        events: [
          {
            ur: '3月までURによる引っ越し先斡旋',
          },
        ],
      },
      3: {
        display_default: false,
        events: [
          {
            day: '末',
            ur: '3月までURによる引っ越し先斡旋',
          },
        ],
      },
      4: {
        display_default: false,
        events: [
          {
            day: 7,
            residents: '住民の会解散',
          },
        ],
      },
      9: {
        display_default: false,
        events: [
          {
            day: 1,
            ur: '73号棟解体作業開始',
          },
        ],
      },
    },
    2015: {
      6: {
        display_default: false,
        events: [
          {
            ur: '73号棟解体作業完了',
          },
        ],
      },
    },
  },
};

export const goodbyeGallery: {
  [year: number]: {
    [month: number]: {
      [day: number]: number;
    };
  };
} = {
  2013: {
    11: {
      13: 1,
      15: 1,
      30: 1,
    },
  },
  2014: {
    2: {
      15: 1,
    },
    3: {
      6: 1,
    },
    9: {
      14: 4,
      23: 2,
      28: 1,
    },
    10: {
      11: 1,
    },
    11: {
      2: 2,
      23: 2,
      28: 3,
    },
    12: {
      2: 1,
      13: 1,
      19: 1,
      26: 4,
      27: 1,
    },
  },
  2015: {
    1: {
      1: 1,
      5: 1,
      7: 2,
      10: 2,
      14: 1,
    },
    2: {
      10: 2,
      19: 1,
      27: 1,
    },
    3: {
      5: 1,
      11: 2,
      12: 1,
      17: 4,
      22: 1,
      27: 3,
      28: 2,
    },
    4: {
      1: 1,
      2: 2,
      3: 1,
      6: 1,
      10: 2,
      15: 2,
      16: 2,
      18: 9,
      25: 1,
    },
    5: {
      8: 1,
      17: 2,
    },
  },
};

export const movements = [
  { year: 2016, month: 7, count: 2 },
  { year: 2016, month: 12, count: 2 },
  { year: 2017, month: 3, count: 2 },
  { year: 2017, month: 7, count: 4 },
  { year: 2018, month: 2, count: 2 },
  { year: 2018, month: 6, count: 1 },
  { year: 2019, month: 7, count: 2 },
  { year: 2020, month: 1, count: 2 },
  { year: 2020, month: 8, count: 1 },
] as const;

export const residents = [
  {
    key: 1,
    name: '中川京子',
    message: '住宅に惚れてます。麻布十番の生まれです。',
    notice: '中川京子さんは、2018年3月にお亡くなりになりました。ご冥福をお祈りいたします。',
    hobby: '小唄､義太夫､謡曲',
    favouriteIndex: '言葉',
    favouriteContents: '人に触れ合う',
    karaoke: '｢隅田川｣(市丸)､｢夜のプラットフォーム｣(渡辺はま子)',
    statement: true,
  },
  {
    key: 2,
    name: '村田英法',
    message: '定年になったら晴耕雨読を夢見ていたのに…。<br>でもこれも人生！楽しまなきゃね！！',
    hobby: '山歩き､旅行､外に出るのが大好き',
    favouriteIndex: '本',
    favouriteContents: '人に触れ合う',
    karaoke: 'フォークから北島三郎まで',
    statement: false,
  },
  {
    key: 3,
    name: '栗原明･(桂城)清子夫妻',
    message:
      '夫婦共に九州出身。上京して東京に家を買う夢がありました。それが叶わず賃貸に。<br>大きな問題に関わり､裁判をして､勉強にはなったが､でも悔しい。<br>国の人は国民の気持ちを考えてほしい。いつになったら”我が家”が持てるのでしょうか？',
    hobby: '映画鑑賞',
    favouriteIndex: '歌手',
    favouriteContents: '吉幾三',
    karaoke: '小指の想い出',
    statement: true,
  },
  {
    key: 4,
    name: '村井和子',
    message: '高幡台団地73号棟､なんとしても守りたい。',
    hobby: '民謡､和裁',
    favouriteIndex: '言葉',
    favouriteContents: '挨拶､ありがとう',
    karaoke: '奥飛騨慕情',
    statement: true,
  },
  {
    key: 5,
    name: '村田公子',
    message: '戦争のない世界､格差のない社会､憲法を守って戦争で生命を脅かされることのないように。',
    hobby: '山野草を眺めるのが大好き。植物や野菜を育てること。山歩き。',
    favouriteIndex: '言葉',
    favouriteContents:
      'すこやかに生まれ､すこやかに育ち､すこやかに老いる＝岩手･旧沢内村村長･深沢晟雄の言葉。',
    karaoke: '特になし､けれど歌うのは好き。',
    statement: true,
  },
  {
    key: 6,
    name: 'K.T',
    message: '常に前を向いて進むように､心がけています。',
    hobby: '草花',
    favouriteIndex: '芸能人',
    favouriteContents: '吉永小百合',
    karaoke: '岬めぐり､他',
    statement: true,
  },
  {
    key: 7,
    name: '畦地笙子',
    message: 'やっぱり､ずっと73号棟に住みたいなー！',
    hobby: '読書(高村薫､桐野夏生など)',
    favouriteIndex: '言葉',
    favouriteContents: '晴耕雨読',
    karaoke: '？(何でも出来るよ！←ウソ！)',
    statement: false,
  },
  {
    key: 8,
    name: 'M.K',
    message: '挨拶代わりの｢バカヤロー！｣。実は照れ屋です。',
    hobby: 'ウォーキング',
    favouriteIndex: '言葉',
    favouriteContents: '成せば成る',
    karaoke: '北島三郎',
    statement: true,
  },
  {
    key: 9,
    name: '畦地豊彦さん',
    notice: '畦地豊彦さんは2012年1月27日に亡くなられました。享年68歳。心よりご冥福をお祈りします。',
    hobby: '',
    favouriteIndex: '',
    favouriteContents: '',
    karaoke: '',
    statement: true,
  },
] as const;
