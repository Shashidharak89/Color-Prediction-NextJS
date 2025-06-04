import CreatePrediction from '@/components/CreatePrediction';
import ColorList from '@/components/ColorList';
import ColorPredictor from '@/components/ColorPredictor';

export default function Home() {
  return (
    <main className="min-h-screen p-6 bg-gray-900 text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🎯 Prediction App</h1>
      <ColorPredictor/>
    </main>
  );
}
