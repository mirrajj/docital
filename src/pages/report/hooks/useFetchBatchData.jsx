import { useState, useEffect } from 'react';
import supabase from '../../../config/supabaseClient';

const useFetchBatchData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBatchData = async (batchNo) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch batch details from the batch table
      const { data: batch, error: batchError } = await supabase
        .from('batch')
        .select('*')
        .eq('batch_no', batchNo)
        .single();

      if (batchError) throw batchError;

      const batch_id = batch.batch_id;

      // Step 2: Fetch finished product inspection data for the batch
      const { data: finishedProduct, error: finishedProductError } = await supabase
        .from('finished_product_inspection')
        .select('total_weight')
        .eq('batch_no', batch_id);

      if (finishedProductError) throw finishedProductError;

      // Step 3: Fetch waste material data for the batch
      const { data: wasteMaterial, error: wasteMaterialError } = await supabase
        .from('waste_material')
        .select('quantity')
        .eq('batch_no', batch_id);

      if (wasteMaterialError) throw wasteMaterialError;

      // Step 4: Fetch raw material data for the batch
      // const { data: rawMaterial, error: rawMaterialError } = await supabase
      //   .from('raw_material')
      //   .select('quantity')
      //   .eq('batch_no', batch_id);

      // if (rawMaterialError) throw rawMaterialError;

      // Step 5: Fetch processing data for the batch
      // const { data: processing, error: processingError } = await supabase
      //   .from('processing')
      //   .select('quantity')
      //   .eq('batch_no', batch_id);

      // if (processingError) throw processingError;

      // Step 6: Fetch drying data for the batch
      // const { data: drying, error: dryingError } = await supabase
      //   .from('drying')
      //   .select('quantity')
      //   .eq('batch_no', batch_id);

      // if (dryingError) throw dryingError;

      // Calculate totals for each category
      const totalFinishedProductWeight = finishedProduct.reduce((sum, item) => sum + item.total_weight, 0);
      const totalWasteMaterialWeight = wasteMaterial.reduce((sum, item) => sum + item.quantity, 0);
      // const totalRawMaterialWeight = rawMaterial.reduce((sum, item) => sum + item.quantity, 0);
      // const totalProcessingWeight = processing.reduce((sum, item) => sum + item.quantity, 0);
      // const totalDryingWeight = drying.reduce((sum, item) => sum + item.quantity, 0);

      // Format the data into the desired structure
      const chartData = [
        {
          value: 'finished_product',
          weight: totalFinishedProductWeight,
          fill: 'var(--color-finished_product)',
        },
        {
          value: 'waste_material',
          weight: totalWasteMaterialWeight,
          fill: 'var(--color-waste_material)',
        },
        // {
        //   browser: 'raw_material',
        //   visitors: totalRawMaterialWeight,
        //   fill: 'var(--color-raw-material)',
        // },
        // {
        //   browser: 'processing',
        //   visitors: totalProcessingWeight,
        //   fill: 'var(--color-processing)',
        // },
        // {
        //   browser: 'drying',
        //   visitors: totalDryingWeight,
        //   fill: 'var(--color-drying)',
        // },
      ];

      return chartData;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching batch data:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchBatchData };
};

export default useFetchBatchData;