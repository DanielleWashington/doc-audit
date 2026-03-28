'use client';
import { useState } from 'react';
import Header from '../components/Header.jsx';
import DecisionTree from '../components/DecisionTree.jsx';
import ReportView from '../components/ReportView.jsx';

export default function HomePage() {
  const [report, setReport] = useState(null);
  return (
    <>
      <Header />
      <main>
        {report
          ? <ReportView data={report} onBack={() => setReport(null)} />
          : <DecisionTree onReport={setReport} />}
      </main>
    </>
  );
}
